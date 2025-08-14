export class GitHubService {
  private baseUrl = "https://api.github.com";

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
      const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!repoMatch) {
        return { contracts: [], error: "Invalid GitHub URL format" };
      }

      const [, owner, repo] = repoMatch;
      const cleanRepo = repo.replace(/\.git$/, "");

      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CyberChari-Audit-Platform",
      };

      if (accessToken) {
        headers["Authorization"] = `token ${accessToken}`;
      }

      // Get repository tree
      const treeResponse = await fetch(
        `${this.baseUrl}/repos/${owner}/${cleanRepo}/git/trees/${branch}?recursive=1`,
        { headers }
      );

      if (!treeResponse.ok) {
        throw new Error(`GitHub API error: ${treeResponse.status}`);
      }

      const treeData = await treeResponse.json();
      const contractFiles = treeData.tree.filter((file: any) => 
        file.type === "blob" && (file.path.endsWith(".sol") || file.path.endsWith(".vy"))
      );

      const contracts = [];

      for (const file of contractFiles) {
        try {
          const contentResponse = await fetch(
            `${this.baseUrl}/repos/${owner}/${cleanRepo}/contents/${file.path}?ref=${branch}`,
            { headers }
          );

          if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            const content = Buffer.from(contentData.content, "base64").toString("utf-8");
            
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
      console.error("GitHub parsing error:", error);
      return { 
        contracts: [], 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }

  async validateRepository(repoUrl: string, accessToken?: string): Promise<boolean> {
    try {
      const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!repoMatch) return false;

      const [, owner, repo] = repoMatch;
      const cleanRepo = repo.replace(/\.git$/, "");

      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CyberChari-Audit-Platform",
      };

      if (accessToken) {
        headers["Authorization"] = `token ${accessToken}`;
      }

      const response = await fetch(`${this.baseUrl}/repos/${owner}/${cleanRepo}`, { headers });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const githubService = new GitHubService();
