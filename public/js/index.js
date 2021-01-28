// waiting for the document to load
$(document).ready(function () {
  window.globals = {
    current: "",
    past: "",
    recommendation: ""
  };

  // get the username and place it in the dashboard
  fetch("/api/get_user").then(response => response.json())
    .then((data) => {
      $("#name-of-user").text(data.name);
    })

  // Slider settings
  let sliderSetings = {
    item: 3,
    slideMove: 1,
    easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
    slideMargin: 20,
    speed: 600,
    addClass: "center-slide",
    enableDrag: false,
    responsive: []
  }

  // assign current and past book sliders
  let sliderCurrent = $("#lightSlider-current").lightSlider(sliderSetings);
  let sliderPast = $("#lightSlider-past").lightSlider(sliderSetings);

  // set global variables in order to refresh
  window.globals = {
    current: sliderCurrent,
    past: sliderPast,
  };

  globals.current.refresh();

  // get the recommeded books and appended in the recommendation slide
  getRecommendation(recommendationISBN => {

    for (let i = 0; i < recommendationISBN.length; i++) {
      let img = $("<img>").attr("src", getBookCover(recommendationISBN[i]));
      img.attr("data-isbn", recommendationISBN[i]);
      img.attr("alt", `ISBN: ${recommendationISBN[i]}`);
      img.addClass("pointer")
      let li = $("<li>");
      li.addClass("center-slide");
      li.attr("data-id", recommendationISBN[i]);
      li.append(img);
      $("#lightSlider-recommendation").append(li);
    }

    let sliderRecommendation = $("#lightSlider-recommendation").lightSlider(sliderSetings);
    window.globals = {
      current: sliderCurrent,
      past: sliderPast,
      recommendation: sliderRecommendation
    }
    $("#recommendation-placeholder").addClass('hide'); // hide the loader
    $("#lightSlider-recommendation").removeClass('hide'); // show the slider
  });

  // When the navigation tabs are clicked

  //Past book list
  $("#past-link").click(() => {
    resetLink();
    $("#past-link").addClass('active')
    $("#past-div").removeClass('hide')
    globals.past.refresh();
  })

  //Current book list
  $("#current-link").click(() => {
    resetLink();
    $("#current-link").addClass('active')
    $("#current-div").removeClass('hide')
    globals.current.refresh();
  })

  //REcommended book list
  $("#recommended-link").click(() => {
    resetLink();
    $("#recommended-link").addClass('active')
    $("#recommended-div").removeClass('hide')
  })

  // function to will reset the navigation
  const resetLink = () => {
    $("#past-link").removeClass('active')
    $("#current-link").removeClass('active')
    $("#recommended-link").removeClass('active')

    $("#current-div").addClass('hide')
    $("#past-div").addClass('hide')
    $("#recommended-div").addClass('hide')
  }

  // when you click on the recommended books it shows a modal
  $("#lightSlider-recommendation").click(e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.matches("img")) {
      getBookInfoWorks($(e.target).attr("data-isbn"), data => {

        $("#modal-new-book").attr("data-isbn", $(e.target).attr("data-isbn"))
        $("#book-cover").html(`<img src='${getBookCover($(e.target).attr("data-isbn"))}'>`)
        $("#book-title").text(data.title)
        $("#book-author").text(data.author.toString())
        $("#book-page").text(data.pageCount)
        $("#book-description").text(data.description)
        $("#book-review").html("");

        if (data.reviews.length == 0) $("#book-review").html("None available at the moment");
        else {
          data.reviews.forEach(el => {
            let stars = $("<p></p>");
            addStars(el.rate, stars);
            $("#book-review").append(stars)
            $("#book-review").append(`<p>${el.content}</p><p>-${el.name}</p>`)
          })
        }
        $("#modal-new-book").modal("show")

      })
    }
  })

  // when you click on the add book to list, it will add the book in the readings database
  $("#add-book").click(e => {
    e.preventDefault();
    let bookObj = {
      isbn: $("#modal-new-book").attr("data-isbn"),
      title: $("#book-title").text(),
      author: $("#book-author").text()
    }

    addBookToList(bookObj, true, (notExists, data) => {
      if (notExists[1]) {
        $("#lightSlider-current").append($(`li[data-id='${$("#modal-new-book").attr("data-isbn")}']`))
        globals.current.refresh();
      }
      $("#modal-new-book").modal("hide")
    })
  });

  // when click on the books in your current list, it will show a modal to rate the book
  $("#lightSlider-current").click(e => {
    e.preventDefault();
    e.stopPropagation();

    if (e.target.matches("img")) {
      $("#modal-rating").attr("data-isbn", $(e.target).attr("data-isbn"))
      $("#modal-rating").modal("show")
    }
  })

  // when the modal for the rating is hidden, the input fields are reset
  $('#modal-rating').on('hidden.bs.modal', function (event) {
    $("#modal-rating").attr("data-isbn", "");
    $("#finished").prop('checked', true);
    $('input[type="radio"][name="rating"]').prop('checked', false);
    $("textarea").val("");
  })

  // when you submit the form for the rating    
  $("#rating-form").submit((e) => {
    e.preventDefault();
    e.stopPropagation();

    // get the information necessary
    let finished = $("input[type='radio'][name='done']:checked").val();
    let rating = parseInt($("input[type='radio'][name='rating']:checked").val());
    let content = $("textarea").val();
    let isbn = $("#modal-rating").attr("data-isbn");

    //find the book id associated to the isbn field
    fetch(`/api/book/${isbn}`)
      .then(response => response.json())
      .then(data => {
        let bookId = data[0].id;

        // if the book is considered finished
        if (finished === "true") {
          let favourite = (rating < 3) ? false : true;
          let updateObj = {
            favourite: favourite,
            bookId: bookId
          }

          // update the book
          fetch(`/api/book/`, {
            method: "PUT",
            headers: {
              "content-type": "application/json",
              "accept": "application/json"
            },
            body: JSON.stringify(updateObj)
          })
            .then(response => response.json())
            .then(data => {
              $("#lightSlider-past").append($(`li[data-id='${isbn}']`));
              $("#modal-rating").modal("hide")
              globals.past.refresh();
            })
        }

        // if the book is considered dropped, delete from the readings table
        else {
          fetch(`/api/book/${bookId}`, {
            method: "DELETE"
          })
            .then(response => response.json())
            .then(data => {
              $(`li[data-id='${isbn}']`).remove();
              globals.current.refresh();
              $("#modal-rating").modal("hide")
            })
        }

        // post request to add a review in the db
        let reviewObj = {
          content: content,
          rating: rating
        }
        fetch(`/api/books/review/${bookId}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "accept": "application/json"
          },
          body: JSON.stringify(reviewObj)
        })
          .then(response => response.json())
          .then(data => console.log("review entered"))

      })
  });

  const resultsList = $("#search-results")
  const titleForm = $("form.title");
  const titleInput = $("input#title-input");

  // when the user submit a title to search
  titleForm.on("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    let title = titleInput.val().trim();

    resultsList.empty();
    searchByTitle(title, result => {
      if (result.length == 0) resultsList.append(`<h5>No Result</h4>`)
      result.forEach(book => {

        let li = $("<li></li>").text(`${book.title} by ${book.author.toString()}`);
        li.attr("data-isbn", book.isbn);
        li.addClass("list-group-item");
        li.addClass("list-group-item-action");
        li.attr("data-title", book.title);
        li.attr("data-author", book.author);

        resultsList.append(li);
      })
    });
  });

  const authorForm = $("form.author");
  const authorInput = $("input#author-input");

  // when the user submit an author to search
  authorForm.on("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();
    let author = authorInput.val().trim();
    resultsList.empty();
    searchByAuthor(author, result => {
      if (result.length == 0) resultsList.append(`<h5>No Result</h4>`)
      result.forEach(book => {

        let li = $("<li></li>").text(`${book.title} by ${book.author.toString()}`);
        li.addClass("list-group-item");
        li.addClass("list-group-item-action");
        li.attr("data-isbn", book.isbn);
        li.attr("data-title", book.title);
        li.attr("data-author", book.author);

        resultsList.append(li);
      })
    });
  });

  // when the modal for the search is shown, 
  // it changes the content for whether the user clicked on the button to add a book to their current or past reading list
  $('#modal-search').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget); // Button that triggered the modal
    let type = button.data('search'); // Extract info from data-* attributes
    let modal = $(this);
    modal.find('.modal-title').text('Add a book to your ' + type + ' reading list.')
    modal.attr('data-search', type)
  })

  // When the user clicks on a search result
  resultsList.click((e) => {
    e.preventDefault();
    if (e.target.matches("li")) {
      let bookObj = JSON.parse(JSON.stringify(e.target.dataset));
      let reading = ($('#modal-search').attr("data-search") === "current") ? true : false;

      // it will call upon the function that runs the api call to add a book if the book is not already in their reading list
      addBookToList(bookObj, reading, (notExists, data) => {
        if (notExists[1]) {
          let img = $("<img>").attr("src", data[0].URL);
          img.attr("data-isbn", data[0].ISBN);
          img.attr("alt", data[0].name);
          img.attr("class", "pointer");
          let li = $("<li>");
          li.attr("data-id", data[0].ISBN);
          li.addClass("center-slide");
          li.addClass("lslide");
          li.append(img);
          if ($('#modal-search').attr("data-search") === "current") {
            $("#lightSlider-current").append(li);
            globals.current.refresh();
          }
          else {
            $("#lightSlider-past").append(li);
            globals.past.refresh();
          }
        }
        titleInput.val("");
        authorInput.val("")
        resultsList.empty();
        $("#modal-search").modal('hide');
      })
    }

  })

  // function to add stars to the review
  const addStars = (num, appendLocation) => {
    for (let i = 0; i < 5; i++) {
      if (i < num) appendLocation.append(`<span class='yellow-star'>★</span>`)
      else appendLocation.append(`<span class='white-star'>☆</span>`)
    }
  }

});
