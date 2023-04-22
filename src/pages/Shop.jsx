import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom';
import CommonSection from '../components/UI/CommonSection'
import { Helmet } from '../components/helmet/Helmet'
import { Container, Row, Col } from "reactstrap"

import { collection, query, where, getDocs } from "firebase/firestore";
import { Timestamp } from 'firebase/firestore';
import {db} from '../firebase_setup/firebase';

import '../styles/shop.css'

import ProductsList from '../components/UI/ProductsList';

export const Shop = () => {
  const location = useLocation();
  let searchTerm = null
  let searchArray = null
  if (location.search) {
    if (location.search.length > 0) {
      searchTerm = location.search.substring(3)
      if (/^\+*$/.test(searchTerm)) {
        searchTerm = ''
      }
      else {
        searchTerm = searchTerm.split('+').join(' ')
        searchArray = searchTerm.split(' ')
      }
      
    }
  }
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState(null);
  const [optionValue, setOptionValue] = useState('');
  const {id} = useParams();
  let title;
  let q
  if (id === undefined && (searchTerm === null || searchTerm === '')) {
    if (items.length === 1) {
      title = "1 Result found"
      q = query(collection(db, "items"))
    } else {
      title = `${items.length} Results found`
      q = query(collection(db, "items"))
    }
  }
  else if (id === undefined && searchTerm != null) {
    if (items.length === 1) {
      title = `1 Result found for '${searchTerm}'`
    } else {
      title = `${items.length} Results found for '${searchTerm}'`
    }
    q = query(collection(db, "items"), where("searchArray", "array-contains", searchArray[0]))
    console.log(q)
  }
  else if (id === 'all') {
    title = 'All products'
    q = query(collection(db, "items"))
  }
  else if (id === '4kuhd') {
    title = '4K Ultra HDs'
    q = query(collection(db, "items"), where("format", "==", "4K Ultra HD"))
  } 
  else if (id === 'bluray') {
    title = 'Blu-rays'
    q = query(collection(db, "items"), where("format", "==", "Blu-ray"))

  }
  else if (id === 'cd') {
    title = 'CDs'
    q = query(collection(db, "items"), where("format", "==", "CD"))

  }
  else if (id === 'bfi') {
    title = 'BFI collections'
    q = query(collection(db, "items"), where("label", "==", "BFI"))

  }
  else {
    title = id.charAt(0).toUpperCase() + id.slice(1)
    q = query(collection(db, "items"), where("label", "==", title))
    title = title + ' collections'
  }

  const fetchItem = async () => {
      await getDocs(q)
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }))
                  .sort((a, b) => {
                      const aTime = new Timestamp(a.createdAt.seconds, a.createdAt.nanoseconds).toDate();
                      const bTime = new Timestamp(b.createdAt.seconds, b.createdAt.nanoseconds).toDate();
                      return bTime - aTime;
                  }); // Sort by createdAt field
              
              setItems(newData);
              console.log(items, newData);
              
              if (newData) {
                let searchItems = newData
                if (searchArray && searchArray.length > 1) {
                  searchItems = newData.filter(item => {
                    for (let i = 0; i < searchArray.length; i++) {
                      
                      if (searchArray[i] !== '' && !item.searchArray.includes(searchArray[i])) {
                        return false;
                      }
                    }
                    return true;
                  });
                  setItems(searchItems)
                }
              }
             
              
              








          });
  }
  



  useEffect(()=>{
    fetchItem();
    setFilteredItems(null);
    setOptionValue('');
  }, [id])
  useEffect(()=>{
    fetchItem();
    setFilteredItems(null);
    setOptionValue('');
  }, [searchTerm])

  const handleFilter = e => {
    setOptionValue(e.target.value)
    if (e.target.value === 'all' || e.target.value === '' ) {
      setFilteredItems(items)
    }
    else if (e.target.value === '4K Ultra HD') {
      setFilteredItems(items.filter(item => item.format === '4K Ultra HD'))
    }
    else if (e.target.value === 'Blu-ray') {
      setFilteredItems(items.filter(item => item.format === 'Blu-ray'))
    }
    else if (e.target.value === 'CD') {
      setFilteredItems(items.filter(item => item.format === 'CD'))
    }
  }

  return (
    <Helmet title={title}>
      <CommonSection title={title} />
      <section className='filter_and_sort'>
        
              <div className="filter_widget">
                <h6>Format</h6>
                <select onChange={handleFilter} value={optionValue}>
                  <option>Filter by Format</option>
                  <option value="all">All formats</option>
                  <option value="4K Ultra HD">4K Ultra HD</option>
                  <option value="Blu-ray">Blu-ray</option>
                  <option value="CD">CD</option>
                </select>
              </div>
           
              <div className="sort_widget">
                <h6>Sort by</h6>
                <select>
                  <option>Featured</option>
                  <option value="ascending">Alphabetically, A-Z</option>
                  <option value="descending">Alphabetically, Z-A</option>
                </select>
              </div>
            
      </section>
      <section>
        <Container>
          <Row>
            {
              !filteredItems ? (
                items.length === 0 ? (
                  <h6>No products are found!</h6>
                ) : (
                  <ProductsList items={items} />
                )
              ) : (
                filteredItems.length === 0 ? (
                  <h1>No products are found!</h1>
                ) : (
                  <ProductsList items={filteredItems} />
                )
              )
              
            
            
            }
          </Row>
        </Container>
      </section>
    </Helmet>
  )
}

