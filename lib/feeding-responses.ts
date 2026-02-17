import { Locale } from './i18n'

export interface FeedingResponse {
    id: number
    response_es: string
    response_en: string
}

export const FEEDING_RESPONSES: FeedingResponse[] = [
    {
        "id": 1,
        "response_es": "¡Ñam ñam! Gracias por la comida 😋",
        "response_en": "Nom nom! Thanks for the food 😋"
    },
    {
        "id": 2,
        "response_es": "¡Delicioso! Justo lo que necesitaba 🍎",
        "response_en": "Delicious! Just what I needed 🍎"
    },
    {
        "id": 3,
        "response_es": "¡Mis niveles de energía están subiendo! ⚡",
        "response_en": "My energy levels are rising! ⚡"
    },
    {
        "id": 4,
        "response_es": "¡Burp! Perdón... estaba muy rico 😳",
        "response_en": "Burp! Excuse me... that was tasty 😳"
    },
    {
        "id": 5,
        "response_es": "¡Eres el mejor cuidador del mundo! 💖",
        "response_en": "You are the best caretaker ever! 💖"
    },
    {
        "id": 6,
        "response_es": "¡Crunch, crunch! ¡Qué crujiente! 🍪",
        "response_en": "Crunch, crunch! So crunchy! 🍪"
    },
    {
        "id": 7,
        "response_es": "Ahora me siento mucho más fuerte 💪",
        "response_en": "I feel much stronger now 💪"
    },
    {
        "id": 8,
        "response_es": "¡Guau! Eso sabía a gloria ✨",
        "response_en": "Wow! Tasted like heaven ✨"
    },
    {
        "id": 9,
        "response_es": "Barriga llena, corazón contento 😊",
        "response_en": "Full tummy, happy heart 😊"
    },
    {
        "id": 10,
        "response_es": "¡Más! ¡Quiero más! (Por favor) 🤤",
        "response_en": "More! I want more! (Please) 🤤"
    },
    {
        "id": 11,
        "response_es": "Cargando baterías... ¡Listo! 🔋",
        "response_en": "Charging batteries... Ready! 🔋"
    },
    {
        "id": 12,
        "response_es": "¡Glup, glup! Gracias humano 🥤",
        "response_en": "Gulp, gulp! Thank you human 🥤"
    },
    {
        "id": 13,
        "response_es": "¡Sabe a rayos y centellas! ¡Me encanta! ⚡",
        "response_en": "Tastes like thunder and lightning! I love it! ⚡"
    },
    {
        "id": 14,
        "response_es": "Me rugían las tripas, gracias 🦁",
        "response_en": "My stomach was growling, thanks 🦁"
    },
    {
        "id": 15,
        "response_es": "¡Yupi! ¡Hora de comer! 🎉",
        "response_en": "Yay! Snack time! 🎉"
    },
    {
        "id": 16,
        "response_es": "Procesando nutrientes... Completado ✅",
        "response_en": "Processing nutrients... Completed ✅"
    },
    {
        "id": 17,
        "response_es": "¡Ahhh! Eso estuvo refrescante 🍃",
        "response_en": "Ahhh! That was refreshing 🍃"
    },
    {
        "id": 18,
        "response_es": "¿Es mi cumpleaños? ¡Qué rico! 🎂",
        "response_en": "Is it my birthday? So yummy! 🎂"
    },
    {
        "id": 19,
        "response_es": "¡Munch, munch! No puedo hablar, estoy comiendo 🤐",
        "response_en": "Munch, munch! Can't talk, eating 🤐"
    },
    {
        "id": 20,
        "response_es": "¡Energía al 100%! Vamos a jugar 🚀",
        "response_en": "100% Energy! Let's play 🚀"
    },
    {
        "id": 21,
        "response_es": "Eres muy amable conmigo 🥺",
        "response_en": "You are so kind to me 🥺"
    },
    {
        "id": 22,
        "response_es": "¡Combustible para la aventura! 🗺️",
        "response_en": "Fuel for adventure! 🗺️"
    },
    {
        "id": 23,
        "response_es": "¡Slurp! ¡Hasta la última gota! 💧",
        "response_en": "Slurp! Every last drop! 💧"
    },
    {
        "id": 24,
        "response_es": "Me siento un poco más grande ahora 📈",
        "response_en": "I feel a little bit bigger now 📈"
    },
    {
        "id": 25,
        "response_es": "¡Excelente elección, chef! 👨🍳",
        "response_en": "Excellent choice, chef! 👨🍳"
    },
    {
        "id": 26,
        "response_es": "Mis circuitos están felices 🤖",
        "response_en": "My circuits are happy 🤖"
    },
    {
        "id": 27,
        "response_es": "¡Qué buen sabor! ⭐⭐⭐⭐⭐",
        "response_en": "Such great flavor! ⭐⭐⭐⭐⭐"
    },
    {
        "id": 28,
        "response_es": "¡Pum! ¡Estallido de sabor! 💥",
        "response_en": "Boom! Flavor explosion! 💥"
    },
    {
        "id": 29,
        "response_es": "Ahora tengo sueño... zzz 😴",
        "response_en": "Now I am sleepy... zzz 😴"
    },
    {
        "id": 30,
        "response_es": "¡Gracias! Te quiero mucho ❤️",
        "response_en": "Thanks! Love you lots ❤️"
    }
]

export function getRandomFeedingResponse(locale: Locale): string {
    const randomIndex = Math.floor(Math.random() * FEEDING_RESPONSES.length)
    const response = FEEDING_RESPONSES[randomIndex]
    return locale === 'es' ? response.response_es : response.response_en
}
