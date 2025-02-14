import { fetchAlgoliaData } from 'api/fetchAlgoliaData'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlgoliaResponseType } from 'types/algolia'
import { handleAppError } from 'wrappers/ErrorWrapper'

interface UseSearchPageOptions {
  indexName: string
  pageTitle: string
}

interface UseSearchPageReturn<T> {
  items: T[]
  isLoaded: boolean
  currentPage: number
  totalPages: number
  searchQuery: string

  handleSearch: (query: string) => void

  handlePageChange: (page: number) => void
}

export function useSearchPage<T>({
  indexName,
  pageTitle,
}: UseSearchPageOptions): UseSearchPageReturn<T> {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1'))
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '')
  const [totalPages, setTotalPages] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (currentPage > 1) params.set('page', currentPage.toString())
    setSearchParams(params)
  }, [searchQuery, currentPage, setSearchParams])

  useEffect(() => {
    document.title = pageTitle
    setIsLoaded(false)

    const fetchData = async () => {
      try {
        const data: AlgoliaResponseType<T> = await fetchAlgoliaData<T>(
          indexName,
          searchQuery,
          currentPage
        )
        setItems(data.hits)
        setTotalPages(data.totalPages)
      } catch (error) {
        handleAppError(error)
      }
      setIsLoaded(true)
    }

    fetchData()
  }, [currentPage, searchQuery, indexName, pageTitle, navigate])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    })
  }

  return {
    items,
    isLoaded,
    currentPage,
    totalPages,
    searchQuery,
    handleSearch,
    handlePageChange,
  }
}
