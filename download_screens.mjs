import fs from 'fs';
import path from 'path';

const screensData = [
  {id: "1843f16441eb42eaaa339cdc5affe805", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAyMzQxODA5ZjgwNTQyMTdiMDFlMWFlNDMzNmIxMjNmEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "2198ad00849c491e9083b501d3f7dc25", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzg3NmYyNzA0OTExMjQyNDhiZGM3YmFhZTA2MWFlM2JkEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "23298a68e3634a4985eb2c07d1667944", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M2NWEwYjllYzZiZjRlOGI5ZWEzY2JlMzY1M2FjODgzEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "2863195b7e17460c9b41816a208224e1", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1NDcxNWNjNmE3ZTAwMWE2MDM2NzdlMDgwYTA5EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "2c2808d7d4a9448480fc7a67084101d9", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQxMDM5ZWMxYWViNTQ1M2ZiOGNhZmQ0NTk3Y2QwOWRhEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "364a1fda71444896af24c2af25f9bda9", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzYxZjdiNjZkYjNmMTRmN2JhMmNhZDhjMDNiZjhlYzA5EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "3f5d214f9c1543f38af0d3a8683669ba", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzUxYWYxYTI4NzliMTRlZDdiZDkwZTFmZTJhMmJkMGNmEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "3f8a050d07a94609af9de565c896132d", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc5YTQ2MTE0NGRlZTQ3ZWJhMTBhMTI4YjgyOGIwNzhlEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "44415aa0cb6541c0ba1afe1b38d379d2", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzNlNzIwMzU2YTI2MzQwNTI4MWJkMzQyZTVlNWQ2MTA4EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "49e1ad5cbc6143a88221b63edf175617", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UyNWUxZjRlOTY1MjQ4ODViOTc4ZGM3NjY4ODg3NzkzEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "54c8df8353c84c0e8e849deb06432cb0", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzkwMGIwYzRiMjBhNDQ5MTc5NzJjOWJjNDVkNzI1MzA1EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "681714d459ad46309bc48a7541c9efe2", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzUyYjBhYWQ4Y2Q3ZTQxZmRiNjZlYTlkNWU2OTAzN2E4EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "6c4735aefcae4eff89af74d1a9453ccd", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQzMThkMmU1MTA5YTQ2MjM4MDEyNmZlODFkNDMzNzNjEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "749f656a97d142ae89c7860350ed461a", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M3NDk1MjU2MDljOTQ1MGM4OTc1MWE3YWQ1ZTlhYzJmEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "788102e5097f4066aea89fb6f5a5b682", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UzYjllNmRjYjE4ZjRhZjlhYTRjMzVkNWQxYWY3ZjIxEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "79f945d3245c482388da7f7ce15e6811", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2IzOWYwZjUwYThmNDRjNDA5OGZmODE5NmZkNzgwY2U0EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "7fd72832675241e2908afb2948adecac", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQxY2U1YWI5YzRkMTQ1ZGI5YWY5YTRmYzU5NTRjMGQyEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "835db46f07c14a3e897390b08155de04", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzY4ZGQ3ZjU0OWFhZTQ2ZjhiMmY0MDlhMjg0OTUyMmQyEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "93f518187ef34a1285f973c0d83187e1", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2NmZWZjNGYyOTFjMzRmNzdhMTU5ZWM0MDgxYTM2MzQ2EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "a1191a2e7cb6405899c461e9f87c4506", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2QyNDg4MzhiNThlNzQzYTFhZTNhNjA5NTkxNjgxYWVlEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "b756c0b41f1a4fa28a130a7d5db2d99c", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzg4NjYwNzdhZDYzNjQ0ZmZiNjU0M2MwNjJmNDE5NDVjEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "bb8fd03698f143959cc4e19466bba25e", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2I4MjA2NTU0ZTZiNTQ1MzE5ZTEwMzEyYTA2NDJmYzc2EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "c879eb7cf4884d18b74c40b7b9e00bba", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2IzMjMyY2U4MzRjOTQ4YWY4ZTZiZTczOTBlNmVjZDQ0EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "c97f77c4e5c84b91a5a5b083f981a2f0", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzFjOTc5MWExYWI2MDRjYWFhZDRjZTY0N2I3Y2Y1YzFlEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "d062c202ac384e83801c8e1a91f749ac", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2EzNjNmNmE5ZTUwMDRlNmRiMzY3MmMwNDM2ZTliNDI0EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "d66c4da812b04e70912c32842c89345f", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FiYzNkNDhiYWFhNzQxY2RhMTlmM2YyNGYxNmJhNWRhEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "e8846f8019ee44cc891e9804a25e79e4", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzA4ZDY3NDExNDQ2YTQ0NTk5YWJmOTQ4NGQxOTU5MWJiEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "f0a5901045914b7788cd09d80ffef834", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2FhMGU3NTkxNmNkNjRjZjk4MjU5MzNjM2QxOWY3ZTYwEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "f5589a96ee104dc28310cc6c2bbb9f30", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Y1NjdjN2U2YjEwNDQ4Mjg5MDdiOTdiYTgwZmIzNmExEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "f93474d4f6c3476f950ddb29aa866827", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2EyZThhYTc0NWZkNzQwOTY5MzdmN2IzMmU2YzEzODQzEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "fcebf566cef6464cadb833b75efa8816", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzJiNjRhMjAxN2EzOTQ4NDdiOTI4MTJlN2Y0ZDNkYjE0EgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"},
  {id: "fe2f13fc59ca4f0da6075fc0333bca99", url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2NiOGNkYTc0YmMyOTQ2M2E5MGRhZTFjZGIzMGY2YzRmEgsSBxCV-IWPwQYYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNDMxNTIxOTc1OTc4NjE5Nw&filename=&opi=89354086"}
];

const download = async () => {
  const targetDir = path.join(process.cwd(), 'public', 'screens');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Downloading ${screensData.length} screens...`);

  for (const screen of screensData) {
    try {
      const response = await fetch(screen.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      fs.writeFileSync(path.join(targetDir, `${screen.id}.html`), html);
      console.log(`Downloaded ${screen.id}`);
    } catch (e) {
      console.error(`Failed to download ${screen.id}: ${e.message}`);
    }
  }
};

download();
