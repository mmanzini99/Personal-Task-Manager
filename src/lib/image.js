// Ridimensiona un'immagine (anche dal rullino dell'iPhone) in un PNG quadrato 256×256.
export async function toSquarePng(file, size = 256) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Immagine non leggibile'))
      i.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  } finally {
    URL.revokeObjectURL(url)
  }
}
