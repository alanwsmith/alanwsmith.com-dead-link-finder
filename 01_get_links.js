const grimoireDir = 'test_files'
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const regex = /http:\/\/.*?(?=[") \]])/g

const theLinks = []

fs.readdirSync(grimoireDir).forEach((filename) => {
  if (filename.match(/\.txt$/)) {
    const filePath = path.join(grimoireDir, filename)
    console.log(filePath)
    let matterObject = matter.read(filePath)
    // only process files with an id (which is requried
    // to push the file to the site)
    if (matterObject.data.id) {
      console.log(`  ${matterObject.data.id}`)
      const matches = matterObject.content.match(regex).forEach((link) => {
        console.log(link)
        const details = [
          matterObject.data.id,
          matterObject.data.date,
          filename,
          link,
        ]
        theLinks.push(details)
      })
    }
  }
})

fs.writeFile(
  'data/01_list_of_links.tsv',
  theLinks
    .map((linkDetails) => {
      return linkDetails.join('\t')
    })
    .join('\n'),
  (err) => {
    if (err) {
      console.error(err)
      return
    }
  }
)
