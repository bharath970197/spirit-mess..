document.addEventListener("DOMContentLoaded",()=>{
  const form=document.getElementById("feedbackForm");
  const output=document.getElementById("feedbackMessage");
  if(!form||!output)return;
  let rating=0,category="",feeling="";
  const stars=[...document.querySelectorAll(".star-rating button")];
  const emojis=[...document.querySelectorAll(".feedback-emoji")];
  const categories=[...document.querySelectorAll(".category-button")];
  stars.forEach(b=>b.addEventListener("click",()=>{rating=Number(b.dataset.rating);stars.forEach(s=>s.classList.toggle("active",Number(s.dataset.rating)<=rating));}));
  emojis.forEach(b=>b.addEventListener("click",()=>{feeling=b.dataset.feeling||"";emojis.forEach(x=>x.classList.toggle("selected",x===b));}));
  categories.forEach(b=>b.addEventListener("click",()=>{category=b.dataset.category||"";categories.forEach(x=>x.classList.toggle("active",x===b));}));
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const message=document.getElementById("feedbackText").value.trim();
    if(!rating||!category||!message){output.textContent="Please select a rating, category and enter feedback.";return;}
    try{
      const result=await window.messAPI.submitFeedback({rating,category,message,feeling});
      output.textContent=result.message|| (result.success?"Feedback submitted.":"Unable to submit feedback.");
      if(result.success){form.reset();rating=0;category="";feeling="";stars.forEach(x=>x.classList.remove("active"));emojis.forEach(x=>x.classList.remove("selected"));categories.forEach(x=>x.classList.remove("active"));setTimeout(()=>location.href="dashboard.html",1000);}
    }catch(err){output.textContent="Unable to submit feedback. Please try again.";}
  });
});
