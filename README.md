# Creator Hub

## Instalar
```bash
npm install
```

## Conectar ao Supabase
1. Crie um projeto no Supabase.
2. No SQL Editor, rode o arquivo `supabase.sql` deste projeto.
3. Copie `.env.example` para `.env` e preencha:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```
4. Em Authentication > Providers, mantenha Email habilitado.

## Rodar localmente
```bash
npm run dev
```

## Build
```bash
npm run build
```
