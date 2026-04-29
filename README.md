# EGASA Prode Mundial 2026

Aplicación web interna para gestionar un prode del Mundial 2026 en EGASA.

Permite:

- iniciar sesión con usuario y contraseña
- administrar usuarios
- registrar partidos manualmente
- cargar resultados oficiales
- guardar pronósticos por partido
- calcular puntajes automáticamente
- mostrar ranking global
- revisar el detalle de puntaje por usuario
- comparar predicciones de todos después del cierre de cada partido

---

## Alcance actual

El sistema ya incluye:

- autenticación con credenciales
- roles `ADMIN` y `USER`
- gestión manual de usuarios
- gestión manual de partidos
- carga manual de resultados
- predicciones por partido
- validación de coherencia en eliminación directa
- ranking global
- vista de “Mis pronósticos”
- visibilidad de predicciones de todos después del cierre del partido
- dashboard con resumen para usuario y admin

---

## Reglas del juego

### Fase de grupos
- marcador exacto: **3 puntos**
- resultado correcto (gana / pierde / empata): **1 punto**
- cualquier otro caso: **0 puntos**

### Eliminación directa
La predicción se evalúa con marcador a **120 minutos** y equipo clasificado.

- marcador exacto + clasificado correcto: **5 puntos**
- resultado correcto + clasificado correcto: **2 puntos**
- solo clasificado correcto: **1 punto**
- cualquier otro caso: **0 puntos**

### Reglas de validación
- en fase de grupos **no** se registra clasificado
- en eliminación directa el **clasificado es obligatorio siempre**
- si el marcador tiene ganador, el clasificado debe coincidir con ese ganador
- si el marcador es empate, el clasificado puede ser cualquiera de los dos equipos
- un usuario solo puede modificar su pronóstico **hasta antes del inicio del partido**

### Visibilidad de predicciones
- antes del inicio del partido, cada usuario solo ve su propio pronóstico
- después del cierre del partido, se pueden ver las predicciones de todos
- si el partido ya finalizó, también se muestran los puntos obtenidos por cada usuario

### Desempate del ranking
El ranking global se ordena por:
1. más puntos
2. más aciertos exactos
3. más clasificados correctos
4. username en orden ascendente

---

## Stack

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Prisma**
- **PostgreSQL**
- **NextAuth (Credentials)**
- **Tailwind CSS**

---

## Estructura principal

```txt
app/
  (private)/
    admin/
    dashboard/
    matches/
    my-predictions/
    ranking/
  api/auth/[...nextauth]/
  login/
lib/
  auth-guard.ts
  prisma.ts
  domain/
    matches.ts
    predictions.ts
    scoring.ts
prisma/
  schema.prisma
  seed.ts
types/
  next-auth.d.ts
auth.ts
```

---

## Roles

### ADMIN
Puede:
- crear usuarios
- crear partidos
- cargar resultados oficiales
- ver dashboard operativo

### USER
Puede:
- iniciar sesión
- registrar y editar pronósticos antes del cierre
- ver ranking
- revisar sus pronósticos
- ver predicciones de todos después del cierre de cada partido

---

## Requisitos

Antes de levantar el proyecto necesitas:

- Node.js
- una base de datos PostgreSQL disponible
- variables de entorno configuradas

---

## Variables de entorno

Crea un archivo `.env` con valores reales para tu entorno:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_SECRET="tu_secreto_seguro"
ADMIN_SEED_PASSWORD="tu_password_inicial_admin"
```

> No subas `.env` al repositorio.

---

## Instalación

Instala dependencias:

```bash
npm install
```

Aplica migraciones:

```bash
npx prisma migrate dev
```

Ejecuta el seed inicial:

```bash
npm run db:seed
```

Levanta el servidor local:

```bash
npm run dev
```

Abre en el navegador:

```txt
http://localhost:3000
```

---

## Seed inicial

El seed crea un usuario administrador inicial usando la variable:

```env
ADMIN_SEED_PASSWORD
```

Ese usuario admin sirve para entrar por primera vez y empezar a gestionar:

- usuarios
- partidos
- resultados

---

## Flujo de uso

### Flujo admin
1. iniciar sesión como admin
2. crear usuarios
3. registrar partidos
4. cargar resultados oficiales
5. revisar ranking y estado general

### Flujo usuario
1. iniciar sesión
2. revisar partidos abiertos
3. registrar pronósticos antes del inicio
4. revisar sus puntos después de los resultados
5. comparar sus predicciones con las de otros usuarios después del cierre

---

## Estado del partido

El estado mostrado por el sistema se deriva automáticamente:

- **Abierto**: todavía se puede pronosticar
- **Cerrado**: el partido ya inició, pero aún no tiene resultado cargado
- **Finalizado**: el resultado oficial ya fue registrado

---

## Pantallas principales

- `/login` → inicio de sesión
- `/dashboard` → resumen principal
- `/matches` → fixture y acceso a pronósticos
- `/ranking` → ranking global
- `/my-predictions` → detalle de pronósticos y puntos
- `/admin/users` → gestión de usuarios
- `/admin/matches` → gestión de partidos
- `/admin/results` → carga de resultados

---

## Comandos útiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:seed
```

---

## Pendientes / mejoras futuras

Fuera del alcance actual:

- recuperación de contraseña
- carga masiva de fixture
- estadísticas avanzadas
- ranking por fase
- exportaciones
- auditoría de cambios
- manejo explícito de partidos cancelados o postergados

---

## Notas de mantenimiento

- la lógica de dominio está centralizada en `lib/domain`
- la lógica de puntaje está en `lib/domain/scoring.ts`
- la validación de predicciones y resultados debe mantenerse consistente entre formularios y server actions
- cualquier cambio en reglas del juego debe reflejarse tanto en scoring como en textos visibles para el usuario

---

## Despliegue

Para desplegar correctamente en Vercel:

1. configurar las variables de entorno
2. asegurar acceso a la base de datos PostgreSQL
3. ejecutar build sin errores
4. validar login, creación de partidos, resultados y ranking en producción

---

## Estado del proyecto

Proyecto interno funcional en evolución, orientado a uso real en EGASA.
