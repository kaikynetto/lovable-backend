import fetch from 'node-fetch';

class DeskApiService {
  constructor(apiUrl = 'https://lovable-backend-git-main-kubbents-projects.vercel.app') {
    this.apiUrl = apiUrl;
    this.config = {
      host: 'flow13.cdrtiyumipyu.us-east-1.rds.amazonaws.com',
      port: 5432,
      database: 'desk',
      user: 'powerbi',
      password: '$_LBv^Ae:Z'
    };
  }

  async testConnection() {
    try {
      console.log('Testando conexão com config:', this.config);
      const response = await fetch(`${this.apiUrl}/api/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resultado testConnection:', result);
      return result;
    } catch (error) {
      console.error('Falha no testConnection:', error);
      return { success: false, error: error.message };
    }
  }

  async executeQuery(sql) {
    try {
      const payload = {
        ...this.config,
        query: sql,
      };
      console.log('Executando query com payload:', payload);

      const response = await fetch(`${this.apiUrl}/api/execute-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Resultado executeQuery:', result);
      return result;
    } catch (error) {
      console.error('Falha executeQuery:', error);
      return { success: false, error: error.message };
    }
  }

  async getTableInfo() {
    const sql = `
      SELECT 
        schemaname,
        tablename,
        (
          SELECT COUNT(*) 
          FROM information_schema.columns 
          WHERE table_schema = schemaname AND table_name = tablename
        ) AS column_count,
        (
          SELECT reltuples::bigint 
          FROM pg_class 
          JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
          WHERE relname = tablename AND nspname = schemaname
        ) AS estimated_rows
      FROM pg_tables 
      WHERE schemaname = 'lucas'
      ORDER BY tablename;
    `;

    return this.executeQuery(sql);
  }
}

// Executa os testes
(async () => {
  const api = new DeskApiService();

  // Testa conexão
  const connectionResult = await api.testConnection();
  if (!connectionResult.success) {
    console.error('Erro na conexão:', connectionResult.error);
    return;
  }

  // Busca info das tabelas
  const tableInfoResult = await api.getTableInfo();
  if (!tableInfoResult.success) {
    console.error('Erro ao obter informações das tabelas:', tableInfoResult.error);
    return;
  }

  console.log('Informações das tabelas:', tableInfoResult.data);
})();
