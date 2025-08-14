export class GitLabService {
  private baseUrl = "https://gitlab.com/api/v4";

  async parseRepository(repoUrl: string, branch: string = "main", accessToken?: string): Promise<{
    contracts: Array<{
      fileName: string;
      filePath: string;
      content: string;
      type: "solidity" | "vyper";
    }>;
    error?: string;
  }> {
    try {
      const repoMatch = repoUrl.match(/gitlab\.com\/([^\/]+\/[^\/]+)/);
      if (!repoMatch) {
        return { contracts: [], error: "Invalid GitLab URL format" };
      }

      const projectPath = encodeURIComponent(repoMatch[1]);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // Get repository tree
      const treeResponse = await fetch(
        `${this.baseUrl}/projects/${projectPath}/repository/tree?recursive=true&ref=${branch}`,
        { headers }
      );

      if (!treeResponse.ok) {
        throw new Error(`GitLab API error: ${treeResponse.status}`);
      }

      const treeData = await treeResponse.json();
      const contractFiles = treeData.filter((file: any) => 
        file.type === "blob" && (file.path.endsWith(".sol") || file.path.endsWith(".vy"))
      );

      const contracts = [];

      for (const file of contractFiles) {
        try {
          const contentResponse = await fetch(
            `${this.baseUrl}/projects/${projectPath}/repository/files/${encodeURIComponent(file.path)}/raw?ref=${branch}`,
            { headers }
          );

          if (contentResponse.ok) {
            const content = await contentResponse.text();
            
            contracts.push({
              fileName: file.path.split("/").pop() || "",
              filePath: file.path,
              content,
              type: file.path.endsWith(".sol") ? "solidity" as const : "vyper" as const,
            });
          }
        } catch (error) {
          console.error(`Error fetching content for ${file.path}:`, error);
        }
      }

      return { contracts };
    } catch (error) {
      console.error("GitLab parsing error:", error);
      return { 
        contracts: [], 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }

  async validateRepository(repoUrl: string, accessToken?: string): Promise<boolean> {
    try {
      const repoMatch = repoUrl.match(/gitlab\.com\/([^\/]+\/[^\/]+)/);
      if (!repoMatch) return false;

      const projectPath = encodeURIComponent(repoMatch[1]);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/projects/${projectPath}`, { headers });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const gitlabService = new GitLabService();
