
# Party Gallery

Stránka s prezentací vzkazů, které vkládají uživatelé. Vzkaz obsahuje text a obrázek. 

Vstup do aplikace je chráněný pomocí JWT tokenu, který zaměňuje heslo v search parametrech za zašifrovaný cookie. Získat lze z naskenování QR kódu, nebo URL adresy. V aplikaci se nachází stránka s možností stáhnutí jednotlivých vzkazů, která je chráněná odděleným JWT tokenem.

Aplikace je spravována pomocí administrace, ve které se dají mazat vzkazy, nahrávat pozadí a upravovat WYSIWYG editorem text třech informačních stránek, dále se dá upravovat prodlení mezi přepínáním obrázků na stránce s prezentací vzkazů.



## Environment Variables

Aby bylo možné zapnout tento projekt je potřeba

`NEXT_PUBLIC_DOMAIN` (Např: http://localhost:3000) - bez lomítka na konci

`NEXT_PUBLIC_SUPABASE_ANON_KEY`

`NEXT_PUBLIC_SUPABASE_URL`

`HESLO` (Heslo, které je v odkazu pro přístup do aplikace)

`VSECHNY_FOTKY_HESLO` (Heslo, které je v odkazu pro přístup na stránku ke stahování)

`JWT_HESLO` (Heslo, se kterým se šifruje JWT token)

`SUPABASE_SERVICE_KEY`

V souboru ***next.config.mjs***
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
     domains: ['priklad.supabase.co'],
   },
 };

export default nextConfig
```



## Instalace

Prvně je potřeba naklonovat a poté v root složce projektu:

```bash
  npm install 
```
    
## Databáze (Supabase)
Tabulka se vzkazy

```sql
create table public.posts (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    image_name text not null,
    name text null,
    constraint posts_pkey primary key (id),
    constraint posts_name_check check ((length(name) < 51))
) tablespace pg_default;
```

Tabulka s nastavením
```sql
create table public.settings (
    id uuid not null default gen_random_uuid (),
    name text not null,
    value text not null,
    rank integer not null default 1,
    constraint settings_pkey primary key (id),
    constraint settings_name_key unique (name)
) tablespace pg_default;
```

Data nastavení (Uložit do .csv souboru a vložit do tabulky nastavení)
```csv
id,name,value,rank
86463d54-74e3-4e17-8096-eb722af4d78f,presentation_delay,5000,6
f8c99882-68cb-4727-9860-284632c9ef8c,program_page_text,<p></p>,8
3204e4c4-c156-494a-9e5e-a5152490d666,main_page_img,a.jpg,4
f85edb06-0736-4ce1-8d4b-14393dd4429d,main_page_text,<p></p>,5
0dc45d96-1813-475c-bd46-356ccb1c78dd,program_page_img,b.jpg,7
be0d1eee-80e9-4d91-9a33-db66c641ebb7,public_page_img,c.jpg,2
c7131be3-6fa6-4c8a-b247-d0b783080c51,main_page_description,,1
be7d85c4-8fbd-4a48-bf17-344c79a11456,public_page_text,<p></p>,3
```

Storage buckets
```sql
insert into storage.buckets (id, name)
  values ('photos', 'photos');

create policy "Fotky muze videt kdokoliv" on storage.objects
  for select using (bucket_id = 'photos');

create policy "Kdokoliv muze nahrat obrazek" on storage.objects
  for insert with check (bucket_id = 'photos');

create policy "Jen prihlaseny uzivatel muze mazat" on storage.objects
  for delete to authenticated using (bucket_id = 'photos');


insert into storage.buckets (id, name)
  values ('settings', 'settings');

create policy "Nastaveni muze videt kdokoliv" on storage.objects
  for select using (bucket_id = 'settings');

create policy "Jen prihlaseny uzivatel muze nahravat" on storage.objects
  for insert to authenticated using (bucket_id = 'settings');

  create policy "Jen prihlaseny uzivatel muze mazat" on storage.objects
  for delete to authenticated using (bucket_id = 'settings');
```
