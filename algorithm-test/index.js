var lodash = require('lodash')

// dummy data
const INPUT = ['xc', 'dz', 'bbb', 'dz', 'dz', 'dz', 'dz', 'bbb', 'dz', 'bbb', 'dz', 'bbb', 'dz']
// const INPUT = ['xc', 'dz', 'bbb', 'dz']
const QUERY = ['bbb', 'ac', 'dz']
const Matrix = [
	[1, 2, 0],
	[4, 5, 6],
	[7, 8, 9],
]

// soal no 1 - special reverse
const specialReverse = (str) => {
	// split the string
	const arrStr = str.match(/\D+|\d+/g)

	return arrStr
		.map((element) => {
			return element.toUpperCase() != element.toLowerCase() // check alphabet or not
				? element.split('').reverse().join('') // reverse the alphabet
				: element
		})
		.join('') // join
}

// soal no 2 - find the longest word
const findLongestWord = (str) => {
	const longestWord = str
		.split(' ')
		.reduce((longest, currentWord) => (currentWord.length > longest.length ? currentWord : longest))
	return `${longestWord}: ${longestWord.length} character`
}

// soal no 3 - special query
const specialQuery = () => {
	const RESULT = QUERY.map((elem) => lodash.sum(INPUT.map((e) => (elem === e ? +1 : 0))))

	// const RESULT = QUERY.map((elem) =>
	// 	INPUT.map((e) => (elem === e ? +1 : 0)).reduce((acc, curr) => acc + curr)
	// )

	console.log(RESULT)

	const OUTPUT =
		`OUTPUT = [${RESULT}] karena` +
		RESULT.map((e, i) => {
			return RESULT.length - 1 === i
				? ` kata '${QUERY[i]}' terdapat ${RESULT[i]} pada INPUT.`
				: e === 0
				? ` kata '${QUERY[i]}' tidak ada pada INPUT,`
				: ` kata '${QUERY[i]}' terdapat ${RESULT[i]} pada INPUT,`
		}).join('')

	return OUTPUT
}

// soal no 4 - soal matriks
const matrixCase = () => {
	const firstDiagonal = Matrix.map((e, i) => e[i])
	const secondDiagonal = Matrix.map((e, i) => e[Math.abs(i - (Matrix.length - 1))])

	const result = lodash.sum(firstDiagonal) - lodash.sum(secondDiagonal)

	console.log(Matrix)
	console.log(firstDiagonal)
	console.log(secondDiagonal)

	return `Jumlah dari ${firstDiagonal} - Jumlah dari ${secondDiagonal} = ${result}`
}

// run special reverse function
console.log(specialReverse('01With4ll0Respect6969'))

// run longest word function
console.log(findLongestWord('Saya sangat senang mengerjakan soal algoritma'))

// run special query function
console.log(specialQuery())

// run matrix case function
console.log(matrixCase())
