/*jshint esversion: 6 */
function submitUrl() {
  var url = document.getElementById("codeUrl").value;
  var regHandler = document.getElementById("response");
  if (url.length === 0) {
    alert("Empty ngrok URL field!");
    return;
  }

  createAndCheckCode().then(function (res) {
    if (res.data.total === 0) {
      sendUrlToKong(url, res.code).then(function (res) {
        var htmlData = `<p>You have registered your URL <b>${url}</b>.<br>` +
          `Now you can use code <b>*483*142*${res.code}#</b></p>`;
        regHandler.innerHTML = htmlData;
      }).catch(err => {
        alert(err);
      });
    }
  }).catch(err => {
    alert(err);
  });
}

function createAndCheckCode() {
  return new Promise(function (res, rej) {
    var code = Math.floor(Math.random() * 1000 + 1);
    $.get(
      "http://haproxy.africastalking-ussd-routing.fa28f330.svc.dockerapp.io:8001/apis?name=" +
      code,
      function (data, status) {
        res({
          data: data,
          code: code
        });
      }
    ).fail(() => {
      rej("An error occured checking your unique code " + code);
    });
  });
}

function sendUrlToKong(url, code) {
  return new Promise(function (res, rej) {
    var postUrl =
      "http://haproxy.africastalking-ussd-routing.fa28f330.svc.dockerapp.io:8001/apis";
    var data = {
      name: code,
      uris: "/" + code,
      upstream_url: url + "/ussd/"
    };
    $.post(postUrl, data, function (data, status) {
      res({
        data: data,
        code: code
      });
    }).fail(() => {
      rej("An error occurred registering your url " + url);
    });
  });
}

function getApis() {
  return new Promise((res, rej) => {
    var url = "http://haproxy.africastalking-ussd-routing.fa28f330.svc.dockerapp.io:8001/apis";
    $.get(
      url,
      function (data, status) {
        res(data);
      }
    ).fail(function () {
      rej("An error occurred getting APIs");
    });
  });
}

function loadApis() {
  var apis = document.getElementById("apisDiv");
  getApis().then((res) => {
    var rows = res.data.map(r => {
      return `<tr>
        <td>${r.name}</td>
        <td>${r.upstream_url}</td>
      </tr>`;
    });

    var table = `
        <table class="w3-table-all w3-small">
          <tr>
            <th>USSD CODE</th>
            <th>NGROK URL</th>
          </tr>
          ${rows}
        </table>`;
    apis.innerHTML = table;
  }).catch(err => {
    alert(err);
  });
}