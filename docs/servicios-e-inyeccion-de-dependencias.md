# 🛰️ Servicios e Inyección de Dependencias

Se utilizan servicios Angular (`*.service.ts`) para manejar la lógica de negocio, comunicación con la API y gestión de estado.  
Estos servicios se inyectan en los componentes mediante el sistema de inyección de dependencias de Angular.

---

## Principales servicios

- **`encuestas.service.ts`**: gestiona las operaciones principales sobre encuestas (crear, obtener, actualizar, publicar, enviar respuestas y consultar resultados).
- **`borrador.service.ts`**: maneja el borrador automático de encuestas usando `localStorage`, guardando los cambios en tiempo real mientras el usuario edita.
- **`creadores.service.ts`**: gestiona la solicitud de acceso de los creadores de encuestas.

Funciones principales:
- `addQuestion(question)`: agrega una pregunta al borrador.
- `updateQuestions(questions)`: actualiza el borrador con la lista actual de preguntas.
- `questions$`: observable para suscribirse a los cambios en el borrador.

---

Estos servicios permiten desacoplar la lógica de negocio de los componentes y facilitan la reutilización y el mantenimiento del código.
