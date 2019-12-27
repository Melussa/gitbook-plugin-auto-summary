const Maybe = require('folktale/maybe')

const print = str => x => { console.log(str, x); return x }

const dirEntry = (readmeFilename) => ([ dirPath, hasReadme ]) => {
  const depth = getDirDepth(dirPath)
  const title = getDirTitle(dirPath)
  // console.log('isTitle:', isTitle(filePath));
  if (!hasReadme && depth === 0) {
    return sectionEntries(title)
  } else if (hasReadme ) {
    // console.log(dirPath + readmeFilename);
    // return linkEntries(depth, title, dirPath + readmeFilename)
  } else {
    return disabledEntries(depth, title)
  }
}

const getDirTitle = path =>
  Maybe.of(path.split('/'))
    .chain(x => Maybe.fromNullable(x[x.length - 2]))
    .map(title => formatTitle(title))
    .getOrElse('NO_NAME') // shouldn't happen, right !?

const formatTitle = title =>
  title
    .replace(/^or[0-9]*-/,'') //文章目录排序用： or0- , or10-
    .replace(/\[\d+]/, "")    //去掉 cnblog 的ID
    // .replace(/(_|-)/g,' ')  //去掉下滑线和横线
    .replace(/.md$/,"")       //去掉文件名后缀
    // .replace(/\b\w/g, l => l.toUpperCase())  //首字母大写

const getFileName = path =>
  Maybe.of(path.split('/'))
    .chain(x => Maybe.fromNullable(x[x.length - 1]))
    .getOrElse('NO_NAME') // shouldn't happen, right !?

// (String -> Bool) -> [ String, Markdown ] -> String
const fileEntry = (isReadme) => ([ filePath, parsedMarkdown ]) => {
  // if (isReadme(filePath)) return
  // console.log(parsedMarkdown);
  const depth = getFileDepth(filePath, isReadme(filePath))
  const fileTitle = getFileTitle(parsedMarkdown)
    .getOrElse(getFileName(filePath))
  return linkEntries(depth, fileTitle, filePath)
}

const getFileTitle = parsedMarkdown =>
  parsedMarkdown
    .chain(m => Maybe.fromNullable(m.headings))
    .map(headings => headings[0])
    .filter(title => !!title)
    .map(title => title.trim())

const depthEntries = (depth, entries) =>
  Array(depth).join('    ') + entries

const sectionEntries = (title, path) => `\n## ${title}\n`

const disabledEntries = (depth, title) =>
  depthEntries(depth, `* [${title}]()`)

const linkEntries = (depth, title, path) =>
  depthEntries(depth, `* [${title}](${path})`)

const getFileDepth = (path, isReadme) => {
  if ( !path.includes('README') ) {
    return path.match(/\//g).length + 1
  }else {
    return path.match(/\//g).length
  }
}

const getDirDepth = path => getFileDepth(path) - 1

const buildSummary = config => entries =>{
  const title = config.introdutionConfig.title || "introdution"
  const file = config.introdutionConfig.file || "README.md"
  return `\n* [${title}](${file})\n` + entries.join('\n')
}



module.exports = {
  fileEntry,
  dirEntry,
  buildSummary
}
