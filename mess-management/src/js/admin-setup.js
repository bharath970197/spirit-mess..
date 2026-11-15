document.getElementById("setupForm").addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.getElementById("setupStatus");
  const button = event.currentTarget.querySelector("button");
  button.disabled = true;
  status.textContent = "Creating administrator account...";
  try {
    const response = await fetch("/api/admin/setup", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        setupKey:document.getElementById("setupKey").value,
        username:document.getElementById("username").value.trim(),
        password:document.getElementById("password").value
      })
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Setup failed.");
    event.currentTarget.reset();
    status.textContent = "Admin account created. You can now log in from the login page.";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
