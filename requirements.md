# Prueba Técnica — Senior Full-Stack Engineer

**Empresa:** thinkIN  
**Posición:** Senior Full-Stack Engineer  
**Tiempo total estimado:** 3h de trabajo asíncrono + 30–45 min de defensa en vivo  
**Plazo de entrega:** 5 días naturales desde la recepción de este documento  

## Contexto

En thinkIN gestionamos contact centers para hoteles. Cada interacción con un huésped
(llamada, email, chat, redes sociales) se convierte en un ticket que pasa por distintos
estados hasta resolverse, y nuestros agentes deben poder consultarlos, filtrarlos y editarlos
rápidamente.

Esta prueba consiste en construir una versión simplificada de un gestor de tickets que
represente bien lo que harías en tu día a día: una API en Node.js + TypeScript con
persistencia, una pequeña UI en Vue, tests, y el setup que defenderías en una review.

## El reto

Construye una mini-aplicación full-stack que permita gestionar tickets de soporte de un
contact center.

## Modelo de datos

Cada ticket tiene al menos:

| Campo | Tipo | Notas |
|---|---|---|
| id | string/uuid | generado en el backend |
| hotel_id | string | identificador del hotel al que pertenece |
| subject | string | asunto, máx. 200 caracteres |
| description | string | texto largo |
| channel | enum | phone \| email \| chat \| social |
| status | enum | open \| in_progress \| resolved \| closed |
| priority | enum | low \| medium \| high \| urgent |
| assigned_to | string \| null | id de agente, opcional |
| created_at | datetime |  |
| updated_at | datetime |  |

Puedes añadir campos si te parecen necesarios. Justifícalo en el README.

## Parte 1 — Backend

**Tiempo estimado:** 1,5 a 2 h

### Stack

- Node.js + TypeScript (obligatorio).
- Framework a tu elección (Express, Fastify, NestJS…).
- MongoDB como base de datos (obligatorio para alinearnos con nuestro stack).
- Puedes usar Docker Compose para levantar MongoDB en local. Si no usas Docker,
déjalo claro en el README.

### Endpoints requeridos

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/v1/tickets | Crear ticket |
| GET | /api/v1/tickets | Listar tickets con filtros |
| GET | /api/v1/tickets/:id | Obtener un ticket por id |
| PATCH | /api/v1/tickets/:id | Actualizar ticket (parcial) |
| DELETE | /api/v1/tickets/:id | Borrado lógico (soft delete) |

### Filtros del listado

El `GET /api/v1/tickets` debe aceptar query params para filtrar por:

- hotel_id
- status
- priority
- channel
- assigned_to
- Búsqueda de texto en subject o description (`q=...`)

Y soportar paginación (`page`, `page_size`, máximo razonable).

### Requisitos no funcionales

- Validación de inputs (Zod, Joi, class-validator… lo que prefieras).
- Manejo de errores consistente (respuestas HTTP correctas, no devolver stacks de error).
- Logging mínimo viable.
- Tests de los endpoints principales, al menos:
  - crear
  - listar con filtros
  - actualizar
- Jest, Vitest o lo que uses habitualmente.
- Dockerfile para el backend. No es obligatorio levantar todo el stack, pero sí el backend.
- README.md con:
  - cómo arrancar
  - cómo correr tests
  - decisiones tomadas
  - qué dejarías para producción

## Parte 2 — Frontend

**Tiempo estimado:** 1 a 1,5 h

### Stack

- Vue 3 + TypeScript (obligatorio).
- Vuetify como librería de componentes (obligatorio).
- Estado global a tu elección. Pinia recomendado, pero no obligatorio.

### Funcionalidad mínima

1. Vista de listado de tickets con tabla:
   - Columnas:
     - subject
     - channel
     - status
     - priority
     - assigned_to
     - created_at
   - Filtros básicos en la UI, al menos:
     - status
     - priority
   - Paginación.

2. Vista o modal de creación de ticket con validación.

3. Edición de un ticket existente. Puede ser inline en la tabla o en otra vista, tú decides.

4. Manejo de estados de carga, vacío y error. No es opcional: queremos verlo.

### Lo que NO necesitas hacer

- No necesitas autenticación.
- No necesitas estilos pixel-perfect: con Vuetify por defecto está bien.
- No necesitas tests de frontend. Bonus si los pones.

## Parte 3 — Pregunta de cierre

**Tiempo estimado:** 10 min, escrita en el README.

Responde brevemente, máximo 250 palabras:

> "Imagina que tu API de tickets pasa de gestionar 1.000 tickets/día a 100.000
> tickets/día. ¿Qué cambiarías de tu solución actual? Da 3 cambios concretos y
> explica el porqué."

## Reglas

- Uso de IA permitido y bienvenido: Copilot, Cursor, ChatGPT, Claude, etc.
- Defenderás lo que entregues, así que asegúrate de entender lo que has escrito.
- Honestidad: declara en el README si usaste IA para algo. No penaliza, suma.
- Tiempo: queremos respetar tu tiempo. Si te pasas de 4 horas, para y entrega lo que
tengas. Documenta lo que harías con más tiempo.
- Más vale incompleto y bien explicado que completo a medias.
- Mínimo viable bien hecho > grande a medio terminar.

## Entregables

Un repositorio Git con:

1. `/backend` — la API en Node + TS.
2. `/frontend` — la app en Vue + Vuetify.
3. `README.md` raíz con:
   - instrucciones de arranque, idealmente `docker compose up` o equivalente
   - decisiones tomadas
   - qué dejarías para producción
   - declaración de uso de IA
   - respuesta a la pregunta de cierre

## Siguiente paso

Cuando recibamos tu entrega, agendaremos una defensa en vivo de 30–45 minutos con el CTO:

- 10 min: walkthrough del código.
- 15 min: preguntas sobre decisiones técnicas y trade-offs.
- 10 min: extensión del problema: "¿cómo añadirías X?".
- 5 min: tus preguntas para nosotros.

Cualquier duda durante la prueba, escríbenos.

¡Suerte y gracias por tu tiempo!

— Equipo thinkIN