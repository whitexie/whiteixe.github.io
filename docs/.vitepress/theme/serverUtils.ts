import { globby } from 'globby';
import matter from 'gray-matter';
import fs from 'fs-extra';
import path from 'node:path'


const rootDir = path.resolve(__dirname, '../../', 'posts')


console.error('rootDir =>  ', rootDir)

export async function getPosts() {
  let paths = await getPostMDFilePaths();
  console.log('getPosts [ paths ] >', paths)
  let posts = await Promise.all(
    paths.map(async (item) => {
      const content = await fs.readFile(item, "utf-8");
      const { data } = matter(content);
      data.date = _convertDate(data.date);
      return {
        frontMatter: data,
        regularPath: `${item.replace(rootDir, '/posts').replace(".md", ".html")}`,
      };
    })
  );
  posts.sort(_compareDate);
  return posts;
}

function _convertDate(date = new Date().toString()) {
  const json_date = new Date(date).toJSON();
  return json_date.split("T")[0];
}

function _compareDate(obj1, obj2) {
  return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1;
}

async function getPostMDFilePaths() {
  let paths = await globby([`${rootDir}/**/*.md`], {
    ignore: ["node_modules", "README.md"],
    deep: 5,
  });
  return paths.filter((item) => item.includes("posts/"));
}

export async function getPostLength() {
  // getPostMDFilePath return type is object not array
  return [...(await getPostMDFilePaths())].length;
}
