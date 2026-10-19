# MANTEN LIMPIO – Control de ingreso/salida

Frontend estático (Vercel) + Supabase (login, base de datos, realtime, reglas RLS).

## 1. Supabase
1. Creá un proyecto en supabase.com. Elegí la región más conveniente (verificá cuáles ofrece; ver "Legal").
2. SQL Editor → pegá y ejecutá `supabase/schema.sql`.
3. Authentication → Sign In / Providers → Email: **desactivá "Allow new users to sign up"** (las cuentas las creás vos).
4. Authentication → Users → *Add user* por cada empleado y para vos (con contraseña).
5. Hacete admin: SQL Editor → `insert into public.admins(uid) select id from auth.users where email='TU@EMAIL';`
6. Project Settings → API: copiá *Project URL* y la clave **anon public** en `config.js`. (La `service_role` NO va en el repo.)

## 2. GitHub
```
git init && git add . && git commit -m "Primera versión"
git branch -M main
git remote add origin https://github.com/facupergola/EmpresaLimpieza.git
git push -u origin main
```
(El repo es público: por eso `config.js` solo lleva claves públicas.)

## 3. Vercel
vercel.com → Add New → Project → importar `EmpresaLimpieza` → Framework "Other", sin build command → Deploy.
Dominio propio: Settings → Domains → Add y crear los registros DNS que Vercel indica. Cada `git push` a `main` redespliega.
En Supabase → Authentication → URL Configuration, poné la URL de Vercel como Site URL.

## 4. Primer uso
Entrá como admin → pestaña Admin → cargá los lugares y el WhatsApp/email de avisos.

## 5. Legal: lo que falta completar (en `index.html`, función `legal()`)
- Razón social, CUIT, domicilio, email de contacto, N° de inscripción RNBD, región de Supabase, plazo de conservación.
- **Inscribir la base en el RNBD de la AAIP** (Trámites a Distancia) antes de poner la app en producción.
- **Notificar por escrito a cada empleado** el sistema de control (art. 71 LCT) y verificar tu convenio colectivo.
- **Transferencia internacional:** USA no figuraba como país adecuado en las fuentes consultadas; verificá su estado actual en la AAIP. Firmá/aceptá las cláusulas contractuales modelo (Disp. 60-E/2016 o Res. 198/2023) con Supabase y Vercel, o elegí región en un país adecuado (UE, Uruguay, etc.).
- Definir plazo de conservación y programar `purge_old_shifts('<plazo>')` con pg_cron.
- Procedimiento para derechos de acceso/rectificación/supresión (10 días corridos / 5 días hábiles).
- Revisar todo con un abogado laboralista/de datos personales.

## 6. Límites conocidos
- Un GPS de celular puede falsearse con apps de ubicación simulada; el servidor valida hora, lugar y distancia, pero no puede garantizar que las coordenadas enviadas sean reales.
- El CSP usa `'unsafe-inline'` porque la app tiene JS inline.
- Cualquier admin ve DNI y ubicación de todos: limitá cuántos admins hay.
