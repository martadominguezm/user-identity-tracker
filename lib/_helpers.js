// const { collection, firestore, getDocs, orderBy, query, where } = require('../index')

import { collection, firestore, getDocs, orderBy, query, where } from '../index'

// Obtener la navegacion de las sesiones de un usuario (limitando las sesiones)
export async function getSessions(userId, actualSessionId) {
  const porcentajeArray = [25, 50, 75, 100] // Define el porcentaje deseado dentro de la función
  const porcentaje = porcentajeArray[2]

  const sessionsRef = collection(firestore, 'sessions')

  // const sessionsRef = collection(firestore, 'sessionsTest')
  const q = query(sessionsRef, where('userId', '==', userId), orderBy('timestamp', 'desc')) // Para luego quedarme con las sesiones más recientes
  const querySnapshot = await getDocs(q)

  // Obtener todas las sesiones únicas del usuario
  const sesionesUnicas = new Set()
  querySnapshot.forEach(document => {
    const { sessionId } = document.data()

    // quitamos la sesion actual
    if (sessionId !== actualSessionId) {
      sesionesUnicas.add(sessionId)
    }
  })
  console.log('sesionesUnicas:', sesionesUnicas)
  console.log('sesionesUnicas size:', sesionesUnicas.size)

  // Calcular el número de sesiones a limitar según el porcentaje
  const limiteSesiones = Math.floor((porcentaje / 100) * sesionesUnicas.size)
  console.log('limiteSesiones:', limiteSesiones)

  // Obtener los documentos correspondientes a las sesiones limitadas
  console.log('documentos totales:', querySnapshot.size - 1) // aqui apareceran los documentos totales + el de /home de la sesion actual
  const documentosLimitados = []
  const sesionesLimitadas = new Set([...sesionesUnicas].slice(0, limiteSesiones)) // pero aqui lo descarta porque no contabiliza la sesion actual
  console.log('sesionesLimitadas:', sesionesLimitadas)
  querySnapshot.forEach(document => {
    const { sessionId } = document.data()
    if (sesionesLimitadas.has(sessionId)) {
      documentosLimitados.push(document)
    }
  })
  console.log('documentosLimitados:', documentosLimitados.length)

  // Ordenar y retornar los documentos limitados
  const navigationArray = documentosLimitados
    .map(document => document.data().navigation)
    .sort((a, b) => a.timestamp - b.timestamp)
    .reverse()

  console.log('navigationArray:', navigationArray)

  return navigationArray
}

// Definición de la función calcularProbabilidades
export function calculateProbabilities(navigation) {
  const routes = [
    '/home',
    '/deportes',
    '/noticias',
    '/aboutus',
    '/tiempo',
    '/carrito',
    '/pistaReservada',
    '/deportes/padel',
    '/deportes/tenis',
    '/deportes/futbol',
    '/deportes/baloncesto',
    '/noticias/eventos',
    '/carrito/pago',
    '/deportes/padel/tiendaPadel',
    '/deportes/padel/reservasPadel',
    '/deportes/tenis/tiendaTenis',
    '/deportes/tenis/reservasTenis',
    '/deportes/futbol/tiendaFutbol',
    '/deportes/futbol/reservasFutbol',
    '/deportes/baloncesto/tiendaBaloncesto',
    '/deportes/baloncesto/reservasBaloncesto',
    '/noticias/eventos/eventoRegistrado',
    '/carrito/pago/pagoCompletado',
  ]

  const transitionMatrix = {}

  // Inicializar la matriz de transición con valores de probabilidad cero
  for (const route1 of routes) {
    transitionMatrix[route1] = {}
    for (const route2 of routes) {
      transitionMatrix[route1][route2] = 0
    }
  }

  // Registrar las transiciones observadas en navigation
  for (let i = 0; i < navigation.length - 1; i++) {
    const actualState = navigation[i]
    const nextState = navigation[i + 1]

    // Verificar si el actualState y nextState están presentes en las rutas
    if (actualState in transitionMatrix && nextState in transitionMatrix[actualState]) {
      transitionMatrix[actualState][nextState] += 1
    }
  }

  // Calcular las probabilidades de transición
  const probabilityMatrix = {}
  for (const route1 of routes) {
    const allTransitions = Object.values(transitionMatrix[route1]).reduce((acc, val) => acc + val)
    probabilityMatrix[route1] = {}
    for (const route2 of routes) {
      if (allTransitions === 0) {
        probabilityMatrix[route1][route2] = 0 // Establecer probabilidad en 0 si no hay transiciones
      } else {
        probabilityMatrix[route1][route2] = transitionMatrix[route1][route2] / allTransitions
      }
    }
  }

  // PRUEBA1: Verificar que las probabilidades de una fila sumen 1
  for (const route1 of routes) {
    const rowProbabilities = Object.values(probabilityMatrix[route1])
    const rowSum = rowProbabilities.reduce((acc, val) => acc + val)

    console.log(`Suma de probabilidades para ${route1}:`, rowSum.toFixed(0))

    if (rowSum.toFixed(0) !== '1') {
      console.log(`¡ERROR! Las probabilidades de la fila ${route1} no suman 1.`)
    }
  }

  // Imprimir la matriz de transición
  console.log('probabilityMatrix', probabilityMatrix)

  // Imprimir la matriz de transición completa
  // console.log(JSON.stringify(probabilityMatrix, null, 2))

  return probabilityMatrix
}

export function improveUserExperience(probabilityMatrix, currentRoute, numClicks) {
  // Elevar la matriz de probabilidades a la potencia n + 2
  const elevatedMatrix = elevateMatrixToPower(probabilityMatrix, numClicks + 2)
  console.log('numClicks:', numClicks)
  console.log('potencia:', numClicks + 2)

  console.log('elevatedMatrix:', elevatedMatrix)

  // console.log('elevatedMatrix:', JSON.stringify(elevatedMatrix, null, 2))

  // Verificar si la ruta actual está en la matriz de probabilidades
  if (elevatedMatrix[currentRoute]) {
    console.log('Ruta actual:', currentRoute)
    const routeProbabilities = elevatedMatrix[currentRoute] // almacena las probabilidades de transicion desde la ruta actual al resto de rutas
    console.log('routeProbabilities de la ruta actual:', routeProbabilities)

    const sortedProbabilities = Object.entries(routeProbabilities).sort((a, b) => b[1] - a[1]) // las ordena de mayor a menos probabilidad
    console.log('sortedProbabilities:', sortedProbabilities)

    // Obtener las dos/tres rutas más probables
    // const mostProbableRoutes = sortedProbabilities.slice(0, 2).map(([route]) => route) // 2 rutas
    const mostProbableRoutes = sortedProbabilities.slice(0, 3).map(([route]) => route) // 3 rutas

    console.log('Rutas más probables:', mostProbableRoutes)

    return mostProbableRoutes
  }
  console.log('La ruta actual no está en la matriz de probabilidades.')
}

let counter = 0
let isSecondCheck = true

// Aqui meteria toda la logica para cerrarle la sesion al usuario si consideramos que es un intruso
export function accessControl(mostProbableRoutesArray, currentRoute, numClicks, next) {
  if (!isSecondCheck) {
    // Obtener la ruta hace dos movimientos
    const routesArray = [
      // si cogemos 2 rutas mas probables
      // mostProbableRoutesArray[mostProbableRoutesArray.length - 5], //coge la pisicion 1
      // mostProbableRoutesArray[mostProbableRoutesArray.length - 6],//coge la pisicion 0

      // si cogemos 3 rutas mas probables
      mostProbableRoutesArray[mostProbableRoutesArray.length - 7], // coge la pisicion 2
      mostProbableRoutesArray[mostProbableRoutesArray.length - 8], // coge la pisicion 1
      mostProbableRoutesArray[mostProbableRoutesArray.length - 9], // coge la pisicion 0
    ]

    // Verificar si la currentRoute está en las mostProbableRoutes
    if (!routesArray.includes(currentRoute)) {
      // Incrementar el contador de veces que no se cumple la condición
      counter++
      console.log('¡¡Posible comportamiento sospechoso!!')
      console.log('La ruta actual no se encuentra entre las rutas esperadas dos saltos atrás.')
      console.log('counter++:', counter)

      // Comprobar si se debe cerrar la sesión
      if (counter === 5) {
        console.log('Cerrando sesión...')

        // Remove from localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('sessionId')
        localStorage.removeItem('userData')
        localStorage.removeItem('userAbility')
        next('/login')
        console.log('Se cerró la sesión del usuario')

        setTimeout(() => {
          location.reload()
        }, 3000)
      }
    }
  }

  // Verificar si el número de clicks ha aumentado en dos unidades
  if (numClicks % 3 === 0 && isSecondCheck) {
    // Obtener la ruta hace dos movimientos
    const routesArray = [
      // mostProbableRoutesArray[mostProbableRoutesArray.length - 5],
      // mostProbableRoutesArray[mostProbableRoutesArray.length - 6],
      mostProbableRoutesArray[mostProbableRoutesArray.length - 7], // coge la pisicion 2
      mostProbableRoutesArray[mostProbableRoutesArray.length - 8], // coge la pisicion 1
      mostProbableRoutesArray[mostProbableRoutesArray.length - 9], // coge la pisicion 0
    ]

    // Verificar si la currentRoute está en las mostProbableRoutes
    if (!routesArray.includes(currentRoute)) {
      // Incrementar el contador de veces que no se cumple la condición
      counter++
      console.log('¡¡Posible comportamiento sospechoso!!')
      console.log('La ruta actual no se encuentra entre las rutas esperadas dos saltos atrás.')
      console.log('counter++:', counter)
    }

    // Ya está en el tercer salto y puede ir controlando el acceso en todos los saltos
    isSecondCheck = false
  }
}

// Función para elevar una matriz a una potencia determinada
function elevateMatrixToPower(matrix, power) {
  let result = { ...matrix } // copia de la matriz inicial utilizando el operador de propagación ...matrix
  for (let i = 1; i < power; i++) {
    // tantas iteraciones como la potencia que definamos
    result = multiplyMatrices(result, matrix) // se multiplica la matriz result por la matriz inicial
  }

  return result // matriz elevada a la potencia que hemos definido (numclicks + 2)
}

// Función para multiplicar dos matrices
function multiplyMatrices(matrix1, matrix2) {
  const result = {}
  for (const route1 in matrix1) {
    result[route1] = {}
    for (const route2 in matrix2) {
      result[route1][route2] = 0
      for (const route3 in matrix1[route1]) {
        result[route1][route2] += matrix1[route1][route3] * matrix2[route3][route2]
      }
    }
  }

  return result
}
