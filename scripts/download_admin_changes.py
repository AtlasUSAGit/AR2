import urllib.request
import json
import os

def main():
    # 1. Load amplify_outputs.json
    outputs_path = "amplify_outputs.json"
    if not os.path.exists(outputs_path):
        print(f"Error: {outputs_path} not found. Please make sure it is in the project root.")
        return

    with open(outputs_path, "r") as f:
        outputs = json.load(f)

    data_config = outputs.get("data", {})
    url = data_config.get("url")
    api_key = data_config.get("api_key")

    if not url or not api_key:
        print("Error: Could not find AppSync URL or API key in amplify_outputs.json.")
        return

    print(f"Connecting to AppSync endpoint: {url}")

    # 2. Query AppElements
    query = """
    query ListAppElements {
      listAppElements(limit: 1000) {
        items {
          id
          type
          content
          isChecked
          position
        }
      }
    }
    """

    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    req = urllib.request.Request(
        url,
        data=json.dumps({"query": query}).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as res:
            response_data = json.loads(res.read().decode("utf-8"))
    except Exception as e:
        print(f"Failed to query database: {e}")
        print("Please verify your internet connection and AWS credentials/API key.")
        return

    if "errors" in response_data:
        print("GraphQL Errors returned from AppSync:")
        print(json.dumps(response_data["errors"], indent=2))
        return

    items = response_data.get("data", {}).get("listAppElements", {}).get("items", [])
    print(f"Successfully retrieved {len(items)} database elements.")

    # 3. Process elements
    pages = []
    cards = []
    checklists_map = {}
    todos = []
    users = []
    departments = []
    user_password_hashes = {}

    for item in items:
        item_id = item.get("id")
        item_type = item.get("type")
        content = item.get("content", "")
        is_checked = bool(item.get("isChecked"))

        if not item_type or not content:
            continue

        try:
            content_obj = json.loads(content) if (content.startswith("{") or content.startswith("[")) else content
        except Exception:
            content_obj = content

        if item_type == "page":
            if isinstance(content_obj, dict):
                pages.append({
                    "id": item_id,
                    "title": content_obj.get("title", ""),
                    "htmlContent": content_obj.get("htmlContent", ""),
                    "needsReview": is_checked
                })
        elif item_type == "card":
            if isinstance(content_obj, dict):
                cards.append({
                    "id": item_id,
                    "title": content_obj.get("title", ""),
                    "content": content_obj.get("content", ""),
                    "needsReview": is_checked
                })
        elif item_type == "checklist":
            checklists_map[item_id] = {
                "id": item_id,
                "title": content_obj if isinstance(content_obj, str) else str(content_obj),
                "items": []
            }
        elif item_type == "todo":
            if isinstance(content_obj, dict):
                todos.append({
                    "id": item_id,
                    "text": content_obj.get("text", ""),
                    "completed": is_checked,
                    "checklistId": content_obj.get("checklistId", "")
                })
        elif item_type == "user":
            if isinstance(content_obj, dict):
                users.append(content_obj)
                # If there's a passwordHash in the user object, track it
                if "passwordHash" in content_obj:
                    user_password_hashes[content_obj["username"].lower()] = content_obj["passwordHash"]
        elif item_type == "department":
            if isinstance(content_obj, dict):
                departments.append(content_obj)

    # Attach todos to checklists
    for todo in todos:
        chk_id = todo["checklistId"]
        if chk_id in checklists_map:
            checklists_map[chk_id]["items"].append({
                "id": todo["id"],
                "text": todo["text"],
                "completed": todo["completed"]
            })

    checklists = list(checklists_map.values())

    # Sort checklists and items to maintain order
    checklists.sort(key=lambda c: c["id"])
    for chk in checklists:
        chk["items"].sort(key=lambda i: i["id"])

    pages.sort(key=lambda p: p["id"])
    cards.sort(key=lambda c: c["id"])
    users.sort(key=lambda u: u["id"])
    departments.sort(key=lambda d: d["id"])

    # Fallback to defaults if DB is completely empty (sanity check)
    if not pages and not cards and not checklists:
        print("Warning: Database returned no pages, cards, or checklists. Aborting overwrite to prevent loss of data.")
        return

    # 4. Generate src/data.ts content
    data_ts_content = f"""import {{ User, Department, DocCard, Checklist, StaticPage }} from './types';

export const defaultDepartments: Department[] = {json.dumps(departments, indent=2)};

export const defaultUsers: User[] = {json.dumps(users, indent=2)};

export const userPasswordHashes: Record<string, string> = {json.dumps(user_password_hashes, indent=2)};

export const defaultPages: StaticPage[] = {json.dumps(pages, indent=2)};

export const defaultCards: DocCard[] = {json.dumps(cards, indent=2)};

export const defaultChecklists: Checklist[] = {json.dumps(checklists, indent=2)};
"""

    with open("src/data.ts", "w") as f:
        f.write(data_ts_content)

    print("Success! Downloaded admin changes and updated src/data.ts with latest database defaults.")

if __name__ == "__main__":
    main()
