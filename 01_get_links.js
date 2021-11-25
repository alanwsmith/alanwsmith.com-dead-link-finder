const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const regex = /http:\/\/.*?(?=[") \]])/g

const theLinks = []

const config = {
  dev: {
    sourceDir: 'test_files',
    outputFile: 'data/01_test_list_of_files.tsv',
    countFile: 'data/01_test_file_count.txt',
  },
  prod: {
    sourceDir: '/Users/alans/Dropbox/grimoire',
    outputFile: 'data/01_list_of_files.tsv',
    countFile: 'data/01_file_count.txt',
  },
}

const env = 'dev'

const reportDetails = {
  totalFileCount: 0,
  siteFileCount: 0,
  linkCount: 0,
}

fs.readdirSync(config[env].sourceDir).forEach((filename) => {
  ////////////////////////////////////////////////////////
  // Only look at .txt files which are the actual content
  if (filename.match(/\.txt$/)) {
    const filePath = path.join(config[env].sourceDir, filename)
    console.log(filePath)
    reportDetails.totalFileCount += 1

    ///////////////////////////////////////////////////////
    // Try to get the front matter
    let matterObject = matter.read(filePath)

    ///////////////////////////////////////////////////////
    // Only process files that have frontmatter (i.e. data)
    if (matterObject.data) {
      /////////////////////////////////////////////////////
      // Only process files that have an id (which are the
      // ones that go to the site
      if (matterObject.data.id) {
        ///////////////////////////////////////////////////
        // Only include files that are published
        if (
          matterObject.data.status.match(/^(archive|scratch|draft|published)$/)
        ) {
          console.log(`-- ${matterObject.data.id}`)
          reportDetails.siteFileCount += 1

          ///////////////////////////////////////////////////
          // Find all the links via the regex match
          const matches = matterObject.content.match(regex)

          ///////////////////////////////////////////////////
          // If there are any links, setup the details and
          // push them onto the main array
          if (matches) {
            matches.forEach((link) => {
              console.log(link)
              reportDetails.linkCount += 1
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
      }
    }
  }
})

fs.writeFile(
  config[env].outputFile,
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

fs.writeFile(
  config[env].countFile,
  `Total Published Files: ${reportDetails.siteFileCount}`,
  (err) => {
    if (err) {
      console.error(err)
      return
    }
  }
)

console.log(reportDetails)
