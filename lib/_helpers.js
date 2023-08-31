// LECTURA DE DATOS //

export async function getSessions(firestore, collection, getDocs, orderBy, query, where, userId, actualSessionId, porcentaje) {

  const sessionsRef = collection(firestore, 'sessions')

  const q = query(sessionsRef, where('userId', '==', userId), orderBy('timestamp', 'desc')) // Para luego quedarme con las sesiones más recientes
  const querySnapshot = await getDocs(q)

  //sesiones únicas del usuario
  const sesionesUnicas = new Set()
  querySnapshot.forEach(document => {
    const { sessionId } = document.data()

    //quitamos la sesion actual
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

  const navigationArray = documentosLimitados
    .map(document => document.data().navigation)
    .sort((a, b) => a.timestamp - b.timestamp)
    .reverse()

  console.log('navigationArray:', navigationArray)

  return navigationArray
}


// MÓDULO DE ANALISIS DE COMPORTAMIENTO //

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

  // Inicializamos la matriz de transición con valores de probabilidad cero
  for (const route1 of routes) {
    transitionMatrix[route1] = {}
    for (const route2 of routes) {
      transitionMatrix[route1][route2] = 0
    }
  }

  // Registramos las transiciones observadas en navigation
  for (let i = 0; i < navigation.length - 1; i++) {
    const actualState = navigation[i]
    const nextState = navigation[i + 1]

    // Verificamos si el actualState y nextState están presentes en las rutas
    if (actualState in transitionMatrix && nextState in transitionMatrix[actualState]) {
      transitionMatrix[actualState][nextState] += 1
    }
  }

  // Calculamos las probabilidades de transición
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

  // PRUEBA: Verificar que las probabilidades de una fila sumen 1
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


// SUBSISTEMA DE ADAPTACIÓN //

export function improveUserExperience(probabilityMatrix, currentRoute, numClicks) {
  // Elevar la matriz de probabilidades a la potencia n + 2
  const elevatedMatrix = elevateMatrixToPower(probabilityMatrix, numClicks + 2)
  console.log('numClicks:', numClicks)
  console.log('potencia:', numClicks + 2)

  console.log('elevatedMatrix:', elevatedMatrix)
  // console.log('elevatedMatrix:', JSON.stringify(elevatedMatrix, null, 2))

  // Verificamos si la ruta actual está en la matriz de probabilidades
  if (elevatedMatrix[currentRoute]) {
    console.log('Ruta actual:', currentRoute)
    const routeProbabilities = elevatedMatrix[currentRoute] // almacena las probabilidades de transicion desde la ruta actual al resto de rutas
    console.log('routeProbabilities de la ruta actual:', routeProbabilities)

    const sortedProbabilities = Object.entries(routeProbabilities).sort((a, b) => b[1] - a[1]) // las ordena de mayor a menos probabilidad
    console.log('sortedProbabilities:', sortedProbabilities)

    // Obtenemos las dos/tres rutas más probables
    const mostProbableRoutes = sortedProbabilities.slice(0, 3).map(([route]) => route) // 3 rutas

    console.log('Rutas más probables:', mostProbableRoutes)

    return mostProbableRoutes
  }
  console.log('La ruta actual no está en la matriz de probabilidades.')
}

let counter = 0
let isSecondCheck = true


// SUBSISTEMA DE CONTROL DE ACCESO //

export function accessControl(mostProbableRoutesArray, currentRoute, numClicks, next) {
  if (!isSecondCheck) {

    const routesArray = [
      // cogemos 3 rutas mas probables
      mostProbableRoutesArray[mostProbableRoutesArray.length - 7], 
      mostProbableRoutesArray[mostProbableRoutesArray.length - 8], 
      mostProbableRoutesArray[mostProbableRoutesArray.length - 9], 
    ]

    // Verificamos si la currentRoute está en las mostProbableRoutes
    if (!routesArray.includes(currentRoute)) {
      // Incrementa el contador con las veces que no se cumple la condición
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

  // Verificamos si el número de clicks ha aumentado en dos unidades
  if (numClicks % 3 === 0 && isSecondCheck) {

    const routesArray = [
      mostProbableRoutesArray[mostProbableRoutesArray.length - 7], 
      mostProbableRoutesArray[mostProbableRoutesArray.length - 8], 
      mostProbableRoutesArray[mostProbableRoutesArray.length - 9], 
    ]

    // Verificamos si la currentRoute está en las mostProbableRoutes
    if (!routesArray.includes(currentRoute)) {

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
