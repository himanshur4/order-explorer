/** Makes the browser save `text` as a file called `fileName`. */
export function downloadFile(fileName: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  // Freed a little later, once the browser has started saving the file.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
