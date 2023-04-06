export default {
  exampleString (prop) {
    return (h, { row }) => {
      return h(
        'span',
        {},
        row[prop]
      )
    }
  }
}
