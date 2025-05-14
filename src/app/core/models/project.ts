

export interface Project {
  id?: number;
  project_name: string;
  tables: Array<{
    table_name: string;
    fields: Array<{
      name: string;
      type: string;
    }>;
  }>;
  framework: number | null;
  framework_name?: string;
  user?: number;
  username?: string;
  date_creation?: string;
  date_modification?: string;
  script_file?: string | null;
  script_url?: string | null;
  zip_file?: string | null;
  zip_url?: string | null;
  status: string;
}