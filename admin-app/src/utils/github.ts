/**
 * GitHub Zero-Manual Direct Commit Utility
 * Safely fetches latest SHA to prevent 409 conflict errors
 */

export interface GitHubCommitResult {
  success: boolean;
  message: string;
  filesCommitted?: string[];
  error?: string;
}

export async function commitFilesToGitHub(
  repoFullName: string,
  token: string,
  branch: string,
  commitMessage: string,
  files: { path: string; content: string }[]
): Promise<GitHubCommitResult> {
  if (!repoFullName || !token) {
    return {
      success: false,
      message: 'GitHub repository and PAT token are required.',
      error: 'Missing credentials'
    };
  }

  const cleanedRepo = repoFullName.trim().replace(/^https?:\/\/github\.com\//, '');
  const filesCommitted: string[] = [];

  try {
    for (const file of files) {
      // 1. Check if file already exists to get its current SHA (prevents 409 Conflict)
      let sha: string | undefined = undefined;
      const getUrl = `https://api.github.com/repos/${cleanedRepo}/contents/${file.path}?ref=${branch}`;

      try {
        const getRes = await fetch(getUrl, {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            Accept: 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        if (getRes.ok) {
          const getData = await getRes.json();
          sha = getData.sha;
        } else if (getRes.status === 401) {
          throw new Error('Invalid GitHub Personal Access Token (401 Unauthorized).');
        } else if (getRes.status === 404) {
          // File does not exist yet; will create new
          sha = undefined;
        }
      } catch (checkErr: any) {
        if (checkErr.message?.includes('401')) {
          throw checkErr;
        }
        // Proceeding with creation
      }

      // 2. Base64 encode file content safely supporting unicode
      const utf8Bytes = new TextEncoder().encode(file.content);
      let binary = '';
      for (let i = 0; i < utf8Bytes.byteLength; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Content = btoa(binary);

      // 3. PUT file update/creation
      const putUrl = `https://api.github.com/repos/${cleanedRepo}/contents/${file.path}`;
      const payload: Record<string, any> = {
        message: `${commitMessage} [${file.path}]`,
        content: base64Content,
        branch: branch || 'main'
      };

      if (sha) {
        payload.sha = sha;
      }

      const putRes = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify(payload)
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to commit ${file.path} (${putRes.status})`);
      }

      filesCommitted.push(file.path);
    }

    return {
      success: true,
      message: `Successfully pushed ${filesCommitted.length} files to ${cleanedRepo} (${branch}).`,
      filesCommitted
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'GitHub commit failed',
      error: String(err)
    };
  }
}
