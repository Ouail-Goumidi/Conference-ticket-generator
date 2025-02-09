const ticketForm = document.forms[0];

const dropArea = document.querySelector(".drag-area");
const inputUpload = document.querySelector(`input[type="file"]`);
const fileTypes = ["image/jpeg", "image/png", "image/jpg"];

const errorMessage = document.createElement("div");
errorMessage.classList.add("error-message");
errorMessage.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="#D1D0D5" stroke-linecap="round" stroke-linejoin="round" d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8Z"/><path fill="#D1D0D5" d="M8.004 10.462V7.596ZM8 5.57v-.042Z"/><path stroke="#D1D0D5" stroke-linecap="round" stroke-linejoin="round" d="M8.004 10.462V7.596M8 5.569v-.042"/></svg>`;

const fullNameErrorMessage = errorMessage.cloneNode(true);
fullNameErrorMessage.appendChild(
  document.createTextNode("Please enter a valid Full Name")
);

const emailAddressErrorMessage = errorMessage.cloneNode(true);
emailAddressErrorMessage.appendChild(
  document.createTextNode("Please enter a valid Email Address")
);

const gitHubUsernameErrorMessage = errorMessage.cloneNode(true);
gitHubUsernameErrorMessage.appendChild(
  document.createTextNode("Please enter a valid Github Username.")
);

// ***-------------------***  ***-------------------*** //

// Standard Function for testing Full_Name or Email

function checkingInfo(input, re, error) {
  if (!re.test(input.value)) {
    input.after(error);
    input.classList.add("error-input");
    return false;
  } else {
    if (input.nextElementSibling !== null) {
      error.remove();
      input.classList.remove("error-input");
    }
    return true;
  }
}

// Check if Github User Exist or Not

async function checkGithubUserFromDB(userName) {
  userName = userName[0] === "@" ? userName.slice(1) : userName;
  try {
    const respon = await fetch(`https://api.github.com/users/${userName}`);
    if (!respon.ok) {
      throw new Error("User Not Found");
    }
    return true;
  } catch (e) {
    return false;
  }
}

function checkGithubUser(input) {
  if (input.value !== "") {
    return new Promise((resolve) => {
      checkGithubUserFromDB(input.value).then((result) => {
        if (!result) {
          input.after(gitHubUsernameErrorMessage);
          input.classList.add("error-input");
          resolve(false);
        } else {
          if (input.nextElementSibling !== null) {
            gitHubUsernameErrorMessage.remove();
            input.classList.remove("error-input");
          }
          resolve(true);
        }
      });
    });
  } else {
    input.after(gitHubUsernameErrorMessage);
    input.classList.add("error-input");
  }
}

// Checking Upload Image

function checkUploadImage() {
  const errorMessage = dropArea.nextElementSibling;
  const checkImage = inputUpload.value === "" ? false : true;
  if (!checkImage) {
    errorMessage.classList.remove("notice");
  } else {
    errorMessage.classList.add("notice");
  }
  return checkImage;
}

// Form Submit

ticketForm.onsubmit = async function (e) {
  e.preventDefault();

  const checkImage = checkUploadImage();

  const checkFullName = checkingInfo(
    this.full_name,
    /^\s*[a-z]{3,}\s+[a-z]{3,}\s*$/i,
    fullNameErrorMessage
  );

  const checkEmail = checkingInfo(
    this.email_address,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
    emailAddressErrorMessage
  );

  const checkGitUser = await checkGithubUser(this.github_username);

  if (checkFullName && checkEmail && checkGitUser && checkImage) {
    // this.submit();
    OpenTicketPage(this);
  }
};

function OpenTicketPage(form) {
  const fullName = form.full_name.value;
  const emailAddress = form.email_address.value;
  const githubUser = form.github_username.value;
  const ticketID = "01609";
  const imageUrl = form.img_src.getAttribute("image-url");
  console.log(imageUrl);
  const locationURL = `ticket.html?full_name=${encodeURIComponent(
    fullName
  )}&email_address=${encodeURIComponent(
    emailAddress
  )}&github_user=${encodeURIComponent(githubUser)}&ticket_id=${ticketID} `;
  sessionStorage.setItem("image_url", imageUrl);

  window.location.replace(locationURL);
}

// Blur The input

ticketForm.full_name.onblur = function () {
  checkingInfo(this, /^\s*[a-z]{3,}\s+[a-z]{3,}\s*$/i, fullNameErrorMessage);
};

ticketForm.email_address.onblur = function () {
  checkingInfo(this, /^[^\s@]+@[^\s@]+\.[^\s@]+$/i, emailAddressErrorMessage);
};

ticketForm.github_username.onblur = function () {
  checkGithubUser(this);
};

// Complete With just keyboard

document.querySelectorAll("form input").forEach((ele, index, arr) => {
  ele.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (index < arr.length - 1) {
        event.preventDefault();
        arr[index + 1].focus();
      } else {
        document.querySelector(".submit-button").click();
        ele.blur();
      }
    }
  });
});

// Drag & Drop Start

dropArea.addEventListener("dragover", function (e) {
  e.preventDefault();
});

dropArea.addEventListener("dragleave", () => {});

dropArea.addEventListener("drop", function (e) {
  e.preventDefault();

  const file = e.dataTransfer.files[0];
  inputUpload.files = e.dataTransfer.files;
  appendUploadImage(file);
});

function appendUploadImage(file) {
  displayErrorMessage(arguments[0]);
  if (fileTypes.includes(file.type) && file.size <= 500_000) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const fileURL = fileReader.result;
      addPhotoAndAction(fileURL);
    };
    fileReader.readAsDataURL(file);
  } else {
    inputUpload.value = "";
  }
}

function displayErrorMessage(file) {
  const errorMessage = dropArea.nextElementSibling;
  if (!fileTypes.includes(file.type)) {
    errorMessage.classList.remove("notice");
    errorMessage.lastChild.textContent = "Upload your photo (JPG or PNG)";
    return false;
  }

  if (file.size > 500_000) {
    errorMessage.classList.remove("notice");
    errorMessage.lastChild.textContent =
      "File to large.Please upload a photo under 500KB";
    return false;
  }

  errorMessage.classList.add("notice");
  errorMessage.childNodes[2].textContent =
    "Upload your photo (JPG or PNG,  max size: 500KB)";
}

function addPhotoAndAction(fileURl) {
  inputUpload.setAttribute("image-url", fileURl);
  dropArea.innerHTML = `
  <div class="photo">
    <img src="${fileURl}" alt="">
  </div>
  <div class="remove-add-image">
    <span class="remove-image">Remove image</span>
    <span class="add-image">Change image</span>
  </div>
  `;
  dropArea.append(inputUpload);
}

dropArea.addEventListener("click", () => {
  if (
    !Array.from(dropArea.children).some((ele) =>
      ele.classList.contains("remove-add-image")
    )
  ) {
    inputUpload.click();
  }
});

inputUpload.addEventListener("change", function (e) {
  const file = this.files[0];

  appendUploadImage(file);
});

addEventListener("click", (e) => {
  if (e.target.classList.contains("add-image")) {
    inputUpload.click();
  }
});

addEventListener("click", (e) => {
  if (e.target.className === "remove-image") {
    inputUpload.value = "";
    inputUpload.removeAttribute("image-url");
    dropArea.innerHTML = `
    <div class="icon">
      <img src="/imgs/icon-upload.svg" alt="">
    </div>
    <span>Drag and drop or click to upload</span>

  `;
    dropArea.append(inputUpload);
  }
});
