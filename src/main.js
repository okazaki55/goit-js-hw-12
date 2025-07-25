import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import axios from 'axios';

const form = document.getElementById('form');
const input = document.getElementById('search');
const loader = document.getElementById('loader-center');
const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');
const loadMoreContainer = document.getElementById('load-more-container');
const loaderBelowButton = document.getElementById('loader-below-button');

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const API_KEY = '51314790-8eb7b58c862d15e75f23e4ac3';
let currentQuery = '';
let currentPage = 1;
const perPage = 40;

iziToast.settings({
  position: `topRight`,
});

async function fetchImages(query, page = 1) {
  const url = 'https://pixabay.com/api/';
  const params = {
    key: API_KEY,
    q: query,
    image_type: `photo`,
    orientation: `horizontal`,
    safesearch: true,
    page,
    per_page: perPage,
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fething images:', error);
    return { hits: [], totalHits: 0 };
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const query = input.value.trim();
  input.value = '';
  if (query === '') return;

  currentQuery = query;
  currentPage = 1;
  gallery.innerHTML = '';
  loader.classList.remove('hidden');
  loadMoreContainer.classList.add('hidden');

  const { hits, totalHits } = await fetchImages(currentQuery, currentPage);

  loader.classList.add('hidden');

  if (hits.length === 0) {
    iziToast.error({
      message:
        'Sorry, there are no images matching your search query. Please try again!',
    });
    return;
  }

  renderGallery(hits);

  if (totalHits > perPage) {
    loadMoreContainer.classList.remove('hidden');
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  loaderBelowButton.classList.remove('hidden');

  const { hits } = await fetchImages(currentQuery, currentPage);

  loaderBelowButton.classList.add('hidden');

  if (hits.length > 0) {
    renderGallery(hits);

    const firstCard = document.querySelector('.gallery a');
    if (firstCard) {
      const cardHeight = firstCard.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } else {
    loadMoreContainer.classList.add('hidden');
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results",
    });
  }
});

function renderGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
      <a href="${largeImageURL}" class="photo-card">
        <img src="${webformatURL}" alt="${tags}"/>
        <div class="info">
          <p><b>Likes</b><br> ${likes}</p>
          <p><b>Views</b><br> ${views}</p>
          <p><b>Comments</b><br> ${comments}</p>
          <p><b>Downloads</b><br> ${downloads}</p>
        </div>
      </a>
    `;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh();
}
