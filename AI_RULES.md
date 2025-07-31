# AI_RULES.md

## Tech Stack

- **Framework:** React
- **TypeScript:** Used for type safety and static typing.
- **React Router:** For routing within the application.
- **Tailwind CSS:** For styling components.
- **Shadcn/UI:** Pre-built components for UI elements.
- **Lucide React:** For icons.
- **Supabase:** For database and authentication needs.

## Coding Rules

- **Components:** Each new component should be placed in `src/components/` and should be 100 lines or less.
- **Imports:** Always use `import { ComponentName } from 'path/to/file';` for third-party imports and `import { ComponentName } from './path/to/file';` for local imports.
- **Styling:** Use Tailwind CSS for styling components.
- **Libraries:** Use Shadcn/UI for pre-built UI components.
- **Icons:** Use Lucide React for icons.
- **Error Handling:** Do not use try/catch blocks unless specifically requested by the user.
- **Database:** Use Supabase for database operations.
- **Authentication:** Use Supabase for authentication.
- **Responsive Design:** Ensure all components are responsive.
- **Code Formatting:** Use <dyad-write> tags for all code output.
- **File Naming:** Directory names must be all lowercase (src/pages, src/components, etc.). File names may use mixed-case if preferred.

Directory names MUST be all lower-case (src/pages, src/components, etc.). File names may use mixed-case if you like.