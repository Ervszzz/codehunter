// GitHub API helpers — public data only
const GITHUB_API = "https://api.github.com";

export interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: Record<string, unknown>;
  created_at: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

async function githubFetch<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${GITHUB_API}${path}`, { headers });

  // If token is invalid, retry without auth (all synced data is public)
  if (res.status === 401 && token) {
    const retry = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (retry.status === 429) throw new Error("GitHub API rate limit exceeded. Try again later.");
    if (retry.status === 403) throw new Error("GitHub API access forbidden.");
    if (!retry.ok) throw new Error(`GitHub API error: ${retry.status} ${path}`);
    return retry.json();
  }

  if (res.status === 429) throw new Error("GitHub API rate limit exceeded. Try again later.");
  if (res.status === 403) throw new Error("GitHub API access forbidden.");
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${path}`);
  return res.json();
}

export async function getPublicEvents(username: string, token?: string): Promise<GitHubEvent[]> {
  return githubFetch<GitHubEvent[]>(`/users/${username}/events/public?per_page=100`, token);
}

export async function getUserProfile(username: string, token?: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${username}`, token);
}

export async function getUserRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(`/users/${username}/repos?per_page=100&sort=updated`, token);
}

export async function getOrgMembers(orgLogin: string, token?: string): Promise<{ login: string; avatar_url: string }[]> {
  return githubFetch(`/orgs/${orgLogin}/members?per_page=100`, token);
}
