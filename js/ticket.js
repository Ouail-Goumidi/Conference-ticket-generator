const params = {};
const queryString = window.location.search.slice(1);
queryString.split("&").forEach((ele) => {
  const [key, value] = ele.split("=");
  params[decodeURIComponent(key)] = decodeURIComponent(value);
});

params.image_url = sessionStorage.getItem("image_url");

document.querySelector(".txt").innerHTML = `
    <h1>
        Congrats, <span class="gradient-text">${params["full_name"]}</span>! Your ticket is ready.
    </h1>
    <p> We've emailed your ticket to</p>
    <p><span style="color:var(--Orange700)">${params.email_address}</span> and will send updates in</p>
    <p>the run up to the event.</p>

`;
document.querySelector(".avatar").src = params.image_url;
document.querySelector(".ticket-id").textContent = "#" + params.ticket_id;
document.querySelector(".full-name").textContent = params.full_name;
document.querySelector(".github-username").textContent = params.github_user;
document.querySelector(".github").onclick = () => {
  window.open(`https://github.com/${params.github_user}`, "_blank");
};
