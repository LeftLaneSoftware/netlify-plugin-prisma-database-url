const fs = require('fs')
const path = require('path')

const glob = require('glob')
const DATABASE_URL_REGEX = /^\s*url\s+=\s+end\(["']DATABASE_URL["']\)/m

const replaceDatabaseUrl = ({ path, contextOrBranch, mode }) => {
  const databaseUrlEnvVar = mode === 'prefix' ? `${contextOrBranch}_DATABASE_URL` : `DATABASE_URL_${contextOrBranch}`
  if (!process.env[databaseUrlEnvVar]) {
    return
  }

  const content = fs.readFileSync(path).toString()
  if (!content.match(DATABASE_URL_REGEX)) {
    return
  }

  const newDatabaseUrl = `url = env("${databaseUrlEnvVar}")`
  const newContent = content.replace(DATABASE_URL_REGEX, newDatabaseUrl)

  fs.writeFileSync(path, newContent)
  console.log(
    `  Replaced \`url\` with \`${newDatabaseUrl}\` in ${path}`
  )
}

module.exports = {
  onPreBuild: ({ inputs }) => {
    const { path, mode } = inputs
    console.log('Replacing DATABASE_URL in schema.prisma...')
    const context = `${process.env.CONTEXT}`.toUpperCase().replace(/-/g, '_')
    const branch = `${process.env.BRANCH}`.toUpperCase().replace(/-/g, '_')
    replaceDatabaseUrl({ path, mode, contextOrBranch: context })
    replaceDatabaseUrl({ path, mode, contextOrBranch: branch })
  },
}
