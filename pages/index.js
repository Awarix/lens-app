import { useState, useEffect } from 'react'
import {
  client, exploreProfiles, getPublications
} from '../api'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { Button, SearchInput, Placeholders } from '../components'

export default function Home() {
  const [searchString, setSearchString] = useState('')
  const [profiles, setProfiles] = useState([])
  const [loadingState, setLoadingState] = useState('loading')

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      searchForPost()
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
  useEffect(() => {
    fetchProfiles()
  }, [])
  async function fetchProfiles() {
    try {
      const response = await client.query(exploreProfiles).toPromise()
      const profileData = await Promise.all(response.data.exploreProfiles.items.map(async profile => {
        const pub = await client.query(getPublications, { id: profile.id, limit: 1 }).toPromise()
        profile.publication = pub.data.publications.items[0]
        let picture = profile.picture
        if (picture && picture.original && picture.original.url) {
          if (picture.original.url.startsWith('ipfs://')) {
            let result = picture.original.url.substring(7, picture.original.url.length)
            profile.picture.original.url = `http://lens.infura-ipfs.io/ipfs/${result}`
          }
        }
        console.log('profile.picture: ', profile.picture)
        return profile
      }))
      setProfiles(profileData)
    } catch (err) {
      console.log({ err })
    }
  }
  console.log({ profiles })
  return (
    <div className={styles.container}>
      <div>
        <Link href={'/profile/newPage.js'}>
          <a>New Page</a>
        </Link>
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
          {
            profiles.map((profile, index) => (
              <Link href={`/profile/${profile.id}`} key={index}>
                <a>
                  {
                    profile.picture ? (
                      <Image
                        src={profile.picture.original?.url || "https://source.unsplash.com/random/200x200?sig=1"}
                        width="52px"
                        height="52px"
                      />
                    ) : <div style={blankPhotoStyle} />
                  }
                  <p>{profile.handle}</p>
                  <p >{profile.publication?.metadata.content}</p>
                </a>
              </Link>
            ))
          }
        </div>
    </div>
  )
}
