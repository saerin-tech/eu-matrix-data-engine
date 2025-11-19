# Query Craft Data Engine

A powerful visual query builder application built with Next.js and React that enables users to construct complex database queries through an intuitive drag-and-drop interface. This project extends the [React Query Builder](https://react-querybuilder.js.org/) library with enterprise features including Supabase/PostgreSQL integration, multi-table joins, dynamic filtering, and real-time query execution with backend webhook integration.

## 🚀 Features

- **Visual Query Builder**: Build complex SQL queries using [react-querybuilder](https://react-querybuilder.js.org/) with an intuitive drag-and-drop interface
- **Supabase/PostgreSQL Integration**: Direct connection to Supabase database with automatic schema detection
- **Advanced JOIN Operations**: Support for INNER, LEFT, and RIGHT joins between multiple tables
- **Dynamic Table & Column Discovery**: Automatically loads database tables and their columns with proper data type mapping
- **Real-time Query Execution**: Execute queries locally or send to backend webhook for processing
- **Smart Filtering**: Multiple operators including equals, contains, greater than, less than, null checks, and more
- **Pagination**: Built-in pagination with customizable rows per page (10, 25, 50, 100)
- **Data Type Mapping**: Automatic PostgreSQL to HTML input type conversion for optimal UX
- **Backend Integration**: Send queries to external webhook (n8n.cloud) for advanced processing
- **Responsive Design**: Modern UI built with Tailwind CSS that works seamlessly across devices
- **TypeScript Support**: Fully typed for better development experience and code safety

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 20 or higher)
- **npm**, yarn, pnpm, or bun package manager
- **Supabase Account** with a configured PostgreSQL database
- **Database RPC Functions** (see setup instructions below)

## 🔧 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/zaavia-team/query-craft.git
cd query-craft-data-engine
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace with your actual Supabase project credentials found in your [Supabase Dashboard](https://app.supabase.com/) under Settings → API.

4. **Configure Supabase RPC Functions:**

Run these SQL commands in your Supabase SQL Editor to enable table and column discovery:

```sql
-- Function to get list of tables
CREATE OR REPLACE FUNCTION get_tables_list()
RETURNS TABLE (table_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT tablename::text
  FROM pg_tables
  WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get columns for a specific table
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (column_name text, data_type text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    column_name::text,
    data_type::text
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = $1
  ORDER BY ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🏃 Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page will auto-reload when you make changes to the code.

### Production Build

Build and run the application for production:

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Query Builder**: [React Query Builder 8.12](https://react-querybuilder.js.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Utilities**: [date-fns](https://date-fns.org/)
- **Code Quality**: ESLint with Next.js config

## 📁 Project Structure

```
query-craft-data-engine/
├── app/
│   ├── components/
│   │   └── Pagination.tsx      # Pagination component with items per page
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client configuration
│   │   └── supabase-server.ts  # Server-side Supabase utilities
│   ├── globals.css             # Global styles and Tailwind imports
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Main query builder page (617 lines)
│   └── QueryBuilder.tsx        # Query builder wrapper component
├── public/                     # Static assets (SVG icons)
├── .env.example                # Environment variables template
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
└── README.md                   # Project documentation
```

## 🎯 Usage

### 1. **Database Connection**
- The app automatically connects to your Supabase database on load
- Connection status is displayed at the top (✅ Connected / ❌ Failed)

### 2. **Select a Table**
- Choose a table from the dropdown (auto-loaded from your database)
- Click the 🔄 Refresh button to reload tables if needed
- Selected table columns are automatically loaded

### 3. **Build Your Query**
The visual query builder allows you to:
- **Add Rules**: Click "+ Rule" to add filter conditions
- **Select Fields**: Choose from available columns (e.g., `users.email`, `orders.status`)
- **Choose Operators**: 
  - Equality: `=`, `!=`
  - Comparison: `<`, `>`, `<=`, `>=`
  - Text: `contains`, `beginsWith`, `endsWith`
  - Null checks: `null`, `notNull`
- **Set Values**: Input values based on column data type (text, number, date, etc.)
- **Combine Conditions**: Use AND/OR combinators for complex logic

### 4. **Configure JOINs**
- Click **"+ JOIN"** button to add table joins
- Select join type (INNER, LEFT, or RIGHT)
- Choose target table and matching columns
- Preview the JOIN statement before adding
- Multiple JOINs are supported and displayed clearly

### 5. **Execute Queries**
Two execution modes:
- **🔍 Execute Query (Local)**: Runs query directly via Supabase client
- **📤 Send to Backend**: Sends query config to webhook endpoint for processing

### 6. **View Results**
- Results displayed in a responsive table format
- Built-in pagination with customizable rows per page
- Nested objects automatically stringified
- Total record count displayed
- Easy navigation through pages

## ⚙️ Configuration

### Backend Webhook
The app sends queries to: `https://eumatrix.app.n8n.cloud/webhook/query`

Payload structure:
```json
{
  "table": "users",
  "conditions": [
    {
      "field": "email",
      "operator": "contains",
      "value": "@example.com"
    }
  ],
  "joins": [
    {
      "type": "INNER",
      "targetTable": "orders",
      "sourceColumn": "id",
      "targetColumn": "user_id"
    }
  ]
}
```

### Supported Operators
- `=`, `!=` - Equality checks
- `<`, `>`, `<=`, `>=` - Numeric comparisons
- `contains`, `beginsWith`, `endsWith` - Text search (case-insensitive)
- `null`, `notNull` - Null checks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**"Please create RPC function in Supabase SQL Editor first!"**
- Make sure you've run the SQL commands to create `get_tables_list()` and `get_table_columns()` functions in your Supabase SQL Editor

**Connection Failed**
- Verify your `.env.local` file has correct Supabase credentials
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart the development server after adding environment variables

**No tables showing**
- Ensure your database has tables in the `public` schema
- Check that RPC functions have `SECURITY DEFINER` flag
- Verify your Supabase project is active

**Backend webhook not working**
- Verify the webhook URL is accessible
- Check the payload format matches your backend expectations
- Review browser console for detailed error messages

## 📝 License

This project is private and proprietary.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Builder Docs](https://react-querybuilder.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 👥 Authors

**Zaavia Team**

## 🙏 Credits

This project is built upon the excellent [React Query Builder](https://react-querybuilder.js.org/) library. Query Craft Data Engine extends React Query Builder with enterprise features including database connectivity, automatic schema discovery, and advanced JOIN operations.

Special thanks to the React Query Builder community for creating such a flexible and powerful foundation.

## 📧 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using Next.js, React Query Builder, and Supabase**
