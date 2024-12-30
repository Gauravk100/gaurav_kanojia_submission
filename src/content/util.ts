export function extractCode(htmlContent: NodeListOf<Element>) {
  // Extract the text content of each line with the 'view-line' class
  const code = Array.from(htmlContent)
    .map((line) => line.textContent || '') // Ensure textContent is not null
    .join('\n');

  return code
}


export function getMaangUserCode (suffix:string){

  let extractedCode = 'User did not wrote any code';

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i); // Get the key at index `i`
    
    if (key && key.endsWith(suffix)) { // Check if the key ends with the desired suffix

      const userCode = localStorage.getItem(key); 

      if(userCode !== '"// Write your code here\n    // You can set your Template at profile settings [https://maang.in/profile/edit-profile]"'){
        extractedCode = userCode ?? '';
      }
    }
  }

  return extractedCode;
}