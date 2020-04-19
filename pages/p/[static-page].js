import Layout from '../../components/layout/normal/layout'
import React from 'react'
import fs from 'fs'
import marked from 'marked'
import matter from 'gray-matter'
import path from 'path'

const Page = ({ htmlString, data}) => {
  return <Layout title={data.title} description={data.description}>
    <div className="markdown" dangerouslySetInnerHTML={{__html: htmlString}}></div>
    
  </Layout>
}

export const getStaticPaths = async() => {
  const files = fs.readdirSync('static-pages')

  const paths = files.map(filename => ({
    params: {
      ['static-page']: filename.replace('.md', '')
    }
  }))

  return {
    paths,
    fallback: false
  }
}


export const getStaticProps = async({ params }) => {
  const slug = params['static-page']
  const markdownWithMetadata = fs.readFileSync(path.join('static-pages', slug + '.md')).toString()
  const parsedMarkdown = matter(markdownWithMetadata)

  return {
    props: {
      data: parsedMarkdown.data,
      htmlString: marked(parsedMarkdown.content)
    }
  }
}


export default Page