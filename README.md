# Shelfwise – Smart Library System

A responsive library app with separate **student** and **staff/admin** portals. Plain HTML, CSS and JavaScript. No install and no build step.

## Features
- Separate logins: students sign in with a student ID, staff and admins use a username. Students can also create their own account.
- **Students:** browse the catalogue, borrow and renew books, see their loans and fines, get suggested reads.
- **Staff and admin:** lend and return books, add or remove books, manage people, see live activity. Only admins can create staff accounts.
- **Live book data:** the Discover tab searches millions of real books from [Open Library](https://openlibrary.org) with covers. Staff can add any result to the catalogue in one click.
- **Live sync:** open the app as staff in one tab and as a student in another. Lending and returning updates both without a refresh.
- Smart rules: 3 books per member, no borrowing with an overdue book, ₹5 per day fine.
- Light and dark themes, works on phones.

## Demo logins
| Role | Username | Password |
|---|---|---|
| Student | S-101 | student123 |
| Staff | staff | staff123 |
| Admin | admin | admin123 |

## Run it in VS Code
1. Install [VS Code](https://code.visualstudio.com/) and open this folder (`File > Open Folder`).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and choose **Open with Live Server**.
4. The app opens at `http://127.0.0.1:5500`. You need internet for the Discover tab and fonts.

No Live Server? Open the VS Code terminal and run `python -m http.server 8000`, then visit `http://localhost:8000`.

## Put it on GitHub
```bash
git init
git add .
git commit -m "Add Shelfwise smart library"
git branch -M main
git remote add origin https://github.com/<your-username>/shelfwise.git
git push -u origin main
```
Create the empty repository on github.com first (no README). To get a free live link, open the repo's **Settings > Pages**, choose branch `main` and folder `/ (root)`, then save.

## Important limits
This is a front-end demo. Data and passwords are stored in the browser's localStorage, so they are not secure and are not shared between different computers. For real use, add a backend such as Firebase or Supabase for accounts and a shared database.

## Files
- `index.html` – page shell
- `style.css` – design and themes
- `app.js` – logins, roles, catalogue, loans, Open Library search, live sync
