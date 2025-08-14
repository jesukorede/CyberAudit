import { githubService } from "./github";
import { gitlabService } from "./gitlab";

export interface ParsedContract {
  fileName: string;
  filePath: string;
  content: string;
  type: "solidity" | "vyper";
}

export interface ParseResult {
  contracts: ParsedContract[];
  error?: string;
}

export class ContractParserService {
  async parseRepository(
    repoUrl: string, 
    branch: string = "main", 
    accessToken?: string
  ): Promise<ParseResult> {
    try {
      // Determine provider
      if (repoUrl.includes("github.com")) {
        return await githubService.parseRepository(repoUrl, branch, accessToken);
      } else if (repoUrl.includes("gitlab.com")) {
        return await gitlabService.parseRepository(repoUrl, branch, accessToken);
      } else {
        return {
          contracts: [],
          error: "Unsupported repository provider. Only GitHub and GitLab are supported.",
        };
      }
    } catch (error) {
      return {
        contracts: [],
        error: error instanceof Error ? error.message : "Unknown parsing error",
      };
    }
  }

  async validateRepository(repoUrl: string, accessToken?: string): Promise<boolean> {
    try {
      if (repoUrl.includes("github.com")) {
        return await githubService.validateRepository(repoUrl, accessToken);
      } else if (repoUrl.includes("gitlab.com")) {
        return await gitlabService.validateRepository(repoUrl, accessToken);
      }
      return false;
    } catch {
      return false;
    }
  }

  extractContractInfo(content: string, fileName: string): {
    contractName?: string;
    pragmaVersion?: string;
    imports: string[];
    functions: string[];
  } {
    const info = {
      imports: [] as string[],
      functions: [] as string[],
    };

    // Extract pragma (Solidity)
    const pragmaMatch = content.match(/pragma\s+solidity\s+([^;]+);/);
    if (pragmaMatch) {
      (info as any).pragmaVersion = pragmaMatch[1].trim();
    }

    // Extract contract name (Solidity)
    const contractMatch = content.match(/contract\s+(\w+)/);
    if (contractMatch) {
      (info as any).contractName = contractMatch[1];
    }

    // Extract imports
    const importMatches = content.match(/import\s+[^;]+;/g);
    if (importMatches) {
      info.imports = importMatches.map(imp => imp.trim());
    }

    // Extract function signatures
    const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)/g);
    if (functionMatches) {
      info.functions = functionMatches.map(func => func.trim());
    }

    return info;
  }
}

export const contractParserService = new ContractParserService();
