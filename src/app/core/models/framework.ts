export interface Framework {
    project_type: string;
    id?: number;
    name: string;
    logo?: File | string | null | any; // This allows logo to be a File, string, null, or any type
    short_description?: string;
    date_creation?: string;
    date_modification?: string;
    logo_url?: string;
    type: 'frontend' | 'backend'; 
  }