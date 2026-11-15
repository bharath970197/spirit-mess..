(() => {
  const call = async (url, options={}) => {
    const response = await fetch(url, { credentials:"same-origin", headers:{"Content-Type":"application/json",...(options.headers||{})}, ...options });
    const data = await response.json().catch(()=>({success:false,message:"Unexpected server response."}));
    if (!response.ok && !data.message) data.message = "Request failed.";
    return data;
  };
  window.messAPI = Object.freeze({
    registerUser: details => call("/api/register",{method:"POST",body:JSON.stringify(details)}),
    loginUser: details => call("/api/login",{method:"POST",body:JSON.stringify(details)}),
    studentLogout: () => call("/api/logout",{method:"POST"}),
    adminLogout: () => call("/api/logout",{method:"POST"}),
    getAdminSummary: () => call("/api/admin/summary"),
    getAdminFeedback: () => call("/api/admin/feedback"),
    getMenu: () => call("/api/menu"),
    saveMenuItem: details => call("/api/menu",{method:"POST",body:JSON.stringify(details)}),
    deleteMenuItem: id => call("/api/menu/"+encodeURIComponent(id),{method:"DELETE"}),
    submitFeedback: details => call("/api/feedback",{method:"POST",body:JSON.stringify(details)}),
    createAwayRequest: details => call("/api/away",{method:"POST",body:JSON.stringify(details)}),
    getMyAwayRequests: () => call("/api/away/mine"),
    getAllAwayRequests: () => call("/api/admin/away"),
    updateAwayRequestStatus: details => call("/api/admin/away/status",{method:"POST",body:JSON.stringify(details)}),
    getMealReport: date => call("/api/admin/meal-report?date="+encodeURIComponent(date||""))
  });
  fetch("/api/me",{credentials:"same-origin"}).then(r=>r.json()).then(({user})=>{
    if(user) { localStorage.setItem("currentUser",JSON.stringify(user)); sessionStorage.setItem("messUser",JSON.stringify(user)); }
  }).catch(()=>{});
})();