import { useState, useEffect, useContext } from 'react'
import { createClient, basicClient, searchPublications, explorePublications, timeline } from '../test-api'
import { ethers } from 'ethers'
import { trimString, generateRandomColor } from '../utils'
import { Button, SearchInput, Placeholders } from '../components'
import { AppContext } from '../context'
import Link from 'next/link'
import styles from '../styles/newPage.module.css'

const typeMap = {
  Comment: "Comment",
  Mirror: "Mirror",
  Post: "Post"
}

export default function newPage() {
  const [posts, setPosts] = useState([])
  const [loadingState, setLoadingState] = useState('loading')
  const [searchString, setSearchString] = useState('')
  const { profile } = useContext(AppContext)

  useEffect(() => {
    fetchPosts() 
  }, [profile])

  async function fetchPosts() {
    const provider = new ethers.providers.Web3Provider(
      (window).ethereum
    )
    const addresses = await provider.listAccounts();
    console.log('addresses: ', addresses)
    if (profile) {
      try {
        const client = await createClient()
        const response = await client.query(timeline, {
          profileId: profile.id, limit: 15
        }).toPromise()
        const posts = response.data.timeline.items.filter(post => {
          if (post.profile) {
            post.backgroundColor = generateRandomColor()
            return post
          }
        })
        setPosts(posts)
        setLoadingState('loaded')
      } catch (error) {
        console.log({ error })
      }
    } else if (!addresses.length) {
      try {
        const response = await basicClient.query(explorePublications).toPromise()
        const posts = response.data.explorePublications.items.filter(post => {
          if (post.profile) {
            post.backgroundColor = generateRandomColor()
            return post
          }
        })
        setPosts(posts)
        setLoadingState('loaded')
      } catch (error) {
        console.log({ error })
      }
    }
  }

  async function searchForPost() {
    setLoadingState('')
    try {
      const urqlClient = await createClient()
      const response = await urqlClient.query(searchPublications, {
        query: searchString, type: 'PUBLICATION'
      }).toPromise()
      const postData = response.data.search.items.filter(post => {
        if (post.profile) {
          post.backgroundColor = generateRandomColor()
          return post
        }
      })
  
      setPosts(postData)
      if (!postData.length) {
        setLoadingState('no-results')
      }
    } catch (error) {
      console.log({ error })
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      searchForPost()
    }
  }

  return (
    <div>
      <div className={styles.searchContainerStyle}>
        <SearchInput
          placeholder='Search'
          onChange={e => setSearchString(e.target.value)}
          value={searchString}
          onKeyDown={handleKeyDown}
        />
        <Button
          buttonText="SEARCH POSTS"
          onClick={searchForPost}
        />
      </div>
      <div className={styles.listItemContainerStyle}>
        {
          loadingState === 'no-results' && (
            <h2>No results....</h2>
          )
        }
        {
           loadingState === 'loading' && <Placeholders number={6} />
        }
        {
          posts.map((post, index) => (
            <Link href={`/profile/${post.profile.id || post.profile.profileId}`} key={index}>
              <a>
                <div className={styles.listItemStyle}>
                  <p className={styles.itemTypeStyle}>{typeMap[post.__typename]}</p>
                  <div className={styles.profileContainerStyle} >
                    {
                      post.profile.picture && post.profile.picture.original ? (
                      <img src={post.profile.picture.original.url} className={styles.profileImageStyle} />
                      ) : (
                        <div
                          className={styles.
                            css`
                            ${placeholderStyle};
                            background-color: ${post.backgroundColor};
                            `
                          }
                        />
                      )
                    }
                    
                    <div className={styles.profileInfoStyle}>
                      <h3 className={styles.nameStyle}>{post.profile.name}</h3>
                      <p className={styles.handleStyle}>{post.profile.handle}</p>
                    </div>
                  </div>
                  <div>
                    <p className={styles.latestPostStyle}>{trimString(post.metadata.content, 200)}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))
        }
      </div>
    </div>
  )
}