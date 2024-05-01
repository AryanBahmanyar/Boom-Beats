// All of our data is available on the global `window` object.
// Create local variables to work with it in this file.
const { artists, songs } = window;

console.log({ artists, songs }, "App Data");

window.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector("#menu");
  const checkbox = document.querySelector("#explicit-filter");

  // array of all input elements with name attribute having the value: "sort-by"
  const sortByOptions = document.querySelectorAll('input[name="sort-by"]');
  const sortOrderOptions = document.querySelectorAll('input[name="sort-order"]');

  let selectedArtistId = null;
  let listIsEmpty = false;

  setSelectedArtist(artists[0]);

  // update list of songs everytime explicit-filter checkbox is checked or unchecked
  checkbox.addEventListener("change", updateSongs);

  // update list of songs everytime sorting order is changed
  for (let option of sortByOptions) {
    option.addEventListener("change", updateSongs);
  }
  for (let option of sortOrderOptions) {
    option.addEventListener("change", updateSongs);
  }

  // add menu button elements
  for (let artist of artists) {
    let button = document.createElement("button");
    button.textContent = artist.name;

    button.addEventListener("click", () => {
      if (artist.artistId !== selectedArtistId) {
        setSelectedArtist(artist);
      }
    });
    menu.appendChild(button);
  }

  function setSelectedArtist(artist) {
    const header = document.querySelector("#selected-artist");
    selectedArtistId = artist.artistId;

    // create a new array of anchor tags from artist.urls and join them to a single string with ', ' as the delimiter
    // target attribute is set to open in new tab or window
    const links = artist.urls
      .map((link) => `<a href=${link.url} target="_blank">${link.name}</a>`)
      .join(", ");
    header.innerHTML = `${artist.name} (${links})`;
    updateSongs();
  }

  function updateSongs() {
    const songList = document.querySelector("#songs");

    // clear all existing cards
    songList.innerHTML = "";

    let filteredSongs = songs.filter((song) => song.artistId === selectedArtistId);

    // filter out explicit songs if the checkbox is checked
    if (checkbox.checked) {
      filteredSongs = filteredSongs.filter((song) => !song.explicit);
    }
    if (filteredSongs.length > 0) {
      // hide message and enable sorting elements if cards list was empty
      if (listIsEmpty) {
        toggleTableEmpty();
      }
      filteredSongs = getSortedSongList(filteredSongs);

      // add each sorted card element to cards list
      filteredSongs.forEach((song) => {
        songList.appendChild(getCardFrom(song));
      });
    }
    // display message and disable sorting elements if table body wasn't empty already
    else if (!listIsEmpty) {
      toggleTableEmpty();
    }
  }
  function getSortedSongList(list) {
    let optionId = null;
    let sortedList = null;

    // check to see which sort option is selected
    for (let option of sortByOptions) {
      if (option.checked) {
        optionId = option.id;
        break;
      }
    }
    // 2 elements are compared at a time when sorting
    // a result of -1 means the first element should go before the second one and vice versa
    // 0 means the value of the elements are equal
    switch (optionId) {
      case "sort-by-name":
        sortedList = sortByObjProperty(list, "title");
        break;
      case "sort-by-year":
        sortedList = list.sort((a, b) => Number(a.year) - Number(b.year));
        break;
      case "sort-by-duration":
        sortedList = list.sort((a, b) => a.duration - b.duration);
        break;
    }
    if (document.querySelector("#sort-descending").checked) {
      return sortedList.reverse();
    }
    return sortedList;
  }

  function sortByObjProperty(list, property) {
    list.sort(function (a, b) {
      const propA = a[property].toLowerCase();
      const propB = b[property].toLowerCase();

      // strings are compared character by character
      if (propA > propB) {
        return 1;
      }
      return propA < propB ? -1 : 0;
    });
    return list;
  }

  function getCardFrom(song) {
    const card = document.createElement("div");
    const image = document.createElement("img");
    const imageContainer = document.createElement("div");
    const title = document.createElement("h3");
    const info = document.createElement("p");
    const mins = Math.ceil(song.duration / 60);
    const secs = song.duration % 60;

    card.classList.add("card");
    image.src = `${song.imageUrl}?auto=format&fit=crop&w=500&q=80`;
    image.alt = song.imageAlt;
    image.addEventListener("click", () => {
      open(song.url, "_blank");
    });
    title.textContent = song.title;
    info.textContent = `${song.year} \u2022 ${mins}:${String(secs).padStart(2, "0")}`;

    imageContainer.appendChild(image);
    card.appendChild(imageContainer);
    card.appendChild(title);
    card.appendChild(info);

    return card;
  }

  function toggleTableEmpty() {
    listIsEmpty = !listIsEmpty;

    // set message visibility to hidden or visible
    document.querySelector("#error-message").style.visibility = listIsEmpty ? "visible" : "hidden";

    // gets arrays from node lists to allow array operations to be done on them
    // (in this case, concatenation)
    const options = Array.from(sortByOptions).concat(Array.from(sortOrderOptions));

    // disable or enable all sorting elements
    for (let option of options) {
      option.disabled = listIsEmpty;
    }
  }
});
