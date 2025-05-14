// Initialize the current section
let currentSection = 'portalScreen';

// 1. Welcome Portal
function enterPortal() {
  document.getElementById(currentSection).style.display = 'none';
  currentSection = 'gameSection';
  document.getElementById(currentSection).style.display = 'block';
  startGame();
}

// 2. Mini Game Logic
const emojis = ['💖', '💖', '💘', '💘', '💕', '💕', '💓', '💓'];
let firstCard = null;
let secondCard = null;
let matchedPairs = 0;

function startGame() {
  const grid = document.getElementById('grid');
  const shuffled = [...emojis].sort(() => 0.5 - Math.random());
  grid.innerHTML = '';
  matchedPairs = 0;

  shuffled.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.addEventListener('click', () => revealCard(card));
    grid.appendChild(card);
  });
}

function revealCard(card) {
  if (card.classList.contains('revealed') || secondCard) return;

  card.textContent = card.dataset.emoji;
  card.classList.add('revealed');

  if (!firstCard) {
    firstCard = card;
  } else {
    secondCard = card;
    setTimeout(() => {
      if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
        matchedPairs++;
        if (matchedPairs === emojis.length / 2) {
          document.getElementById('gameMessage').textContent = 'You did it! 🌟';
          setTimeout(showStars, 2000);
        }
      } else {
        firstCard.textContent = '';
        secondCard.textContent = '';
        firstCard.classList.remove('revealed');
        secondCard.classList.remove('revealed');
      }
      firstCard = null;
      secondCard = null;
    }, 800);
  }
}


// 3. Star Memory Feature
const memories = [
  "You make my world feel so safe 💖",
  "I'm so proud of the person you are 🌟",
  "Being with you feels like home 🏡",
  "You're more than enough, always 💫",
  "Thank you for loving me the way you do 💞",
  "You're the calm to my chaos 🌿",
  "I believe in us, no matter what ❤️",
  "You're my favorite person, every single day 💌",
  "I loveeee youuuu Babbbyyyygooiirrllll 💞",
  "Hieeee Princessssss 💌 🎀",
"My heart goes ‘weeeee’ when I think of you 😍🎀",
  "You’re literally the cutest human ever 🥺💕",
  "Every message from you makes me smile 😊💖",
  "Chap chappp chappp chappp 💋💋💋💋💋💋💋💋",
  "You always know how to make my day better ☀️💫",
  "Thinking about you makes everything feel okay 🌷",
  "You're my little sunshine with extra sparkle ✨🌞",
  "You're my favorite notification 💬💖",
  "I feel lucky just to know you 🍀💞",
  "Your laugh is my favorite sound 😂❤️",
  "How do you make even ordinary moments feel magical? ✨",
  "You're basically my happy place 🎈💗",
  "Falling for you a little more every day 🌸💘",
  "You’re my softest thought at the hardest times 🤍",
  "Lowkey obsessed with how adorable you are 😍💓",
  "Just thinking about you makes my heart smile 😊💞",
  "You're like a cozy hug I never want to end 🤗💝",
  "You make life a little sweeter, just by being in it 🍭❤️",
  "You’re the reason I randomly smile at my phone 🥹📱💖",
  "I still get butterflies when I talk to you 🦋💌",
  "Sending you a million kisses right now 💋💋🧸💘"
];


function showStars() {
  const sky = document.getElementById('sky');
  sky.innerHTML = '';
  document.getElementById('memoryText').textContent = '';

  memories.forEach((memory) => {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = `${Math.random() * 90 + 5}%`;
    star.style.top = `${Math.random() * 80 + 10}px`;
    star.dataset.memory = memory;
    star.addEventListener('click', () => {
      document.getElementById('memoryText').textContent = star.dataset.memory;
    });
    sky.appendChild(star);
  });
}

// 4. Go to Star Memory Section
function goToStarMemory() {
  document.getElementById(currentSection).style.display = 'none';
  currentSection = 'starSection';
  document.getElementById(currentSection).style.display = 'block';
  showStars();
}

// 5. Go to Upload Section
function goToUpload() {
  document.getElementById(currentSection).style.display = 'none';
  currentSection = 'uploadSection';
  document.getElementById(currentSection).style.display = 'block';
}

// 6. Upload Media Handler (images and videos)
document.getElementById('uploadForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData();
  const fileInput = document.getElementById('mediaInput');

  if (fileInput.files.length > 0) {
    formData.append('media', fileInput.files[0]);

    fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.mediaUrl) {
          document.getElementById('mediaDisplay').innerHTML = `
            <h3>Uploaded Media:</h3>
            ${data.mediaType === 'video' 
              ? `<video width="300" controls><source src="http://localhost:3000${data.mediaUrl}" type="video/mp4"></video>`
              : `<img src="http://localhost:3000${data.mediaUrl}" alt="Uploaded Image" style="max-width: 300px;" />`}
          `;
          setTimeout(() => {
            document.getElementById('uploadSection').style.display = 'none';
            currentSection = 'gallerySection';
            loadGallery();
          }, 2000);
        } else {
          alert('Error uploading media.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred.');
      });
  } else {
    alert('Please select a file.');
  }
});

// 7. Load Gallery (images and videos)
function loadGallery() {
  document.getElementById('gallerySection').style.display = 'block';
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  fetch('http://localhost:3000/gallery')
    .then(res => res.json())
    .then(data => {
      const media = data.media;
      if (!media || media.length === 0) {
        gallery.innerHTML = '<p>No media yet.</p>';
        return;
      }

      media.forEach(item => {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.style.position = 'relative';

        if (item.type === 'video') {
          const video = document.createElement('video');
          video.src = 'http://localhost:3000' + item.url;
          video.controls = true;
          video.style.width = '100%';
          video.style.height = '100px';
          video.style.objectFit = 'cover';
          video.style.borderRadius = '8px';
          video.style.cursor = 'pointer';

          video.onclick = function () {
            openFullScreen(video.src, 'video');
          };

          mediaWrapper.appendChild(video);
        } else {
          const img = document.createElement('img');
          img.src = 'http://localhost:3000' + item.url;
          img.style.width = '100%';
          img.style.height = '100px';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '8px';
          img.style.cursor = 'pointer';

          img.onclick = function () {
            openFullScreen(img.src, 'image');
          };

          mediaWrapper.appendChild(img);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.bottom = '5px';
        deleteBtn.style.left = '50%';
        deleteBtn.style.transform = 'translateX(-50%)';
        deleteBtn.style.backgroundColor = '#ff99cc';
        deleteBtn.style.border = 'none';
        deleteBtn.style.padding = '5px 10px';
        deleteBtn.style.borderRadius = '5px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '12px';

        deleteBtn.onclick = function () {
          const confirmDelete = confirm('Are you sure you want to delete this media?');
          if (confirmDelete) {
            deleteMedia(item.url, mediaWrapper);
          }
        };

        mediaWrapper.appendChild(deleteBtn);
        gallery.appendChild(mediaWrapper);
      });
    })
    .catch(err => {
      console.error(err);
      gallery.innerHTML = '<p>Failed to load gallery.</p>';
    });
}

// 8. Delete Media (image or video)
function deleteMedia(url, mediaWrapper) {
  fetch(`http://localhost:3000/delete?mediaUrl=${encodeURIComponent(url)}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        mediaWrapper.remove();
        alert('Media deleted successfully!');
      } else {
        alert('Failed to delete media.');
      }
    })
    .catch(err => {
      console.error('Error deleting media:', err);
      alert('Error deleting media.');
    });
}

// 9. Go to Gallery
function goToGallery() {
  document.getElementById(currentSection).style.display = 'none';
  currentSection = 'gallerySection';
  document.getElementById(currentSection).style.display = 'block';
  loadGallery();
}

// 10. Music Toggle
let isMusicPlaying = false;

function toggleMusic() {
  const musicElement = document.getElementById('bgMusic');
  const playButton = document.getElementById('musicBtn');

  if (isMusicPlaying) {
    musicElement.pause();
    playButton.textContent = '🎶 Play Music';
  } else {
    musicElement.play();
    playButton.textContent = '⏸️ Pause Music';
  }

  isMusicPlaying = !isMusicPlaying;
}

// 11. Back Button
function goBack() {
  document.getElementById(currentSection).style.display = 'none';

  if (currentSection === 'gameSection') {
    currentSection = 'portalScreen';
  } else if (currentSection === 'starSection') {
    currentSection = 'gameSection';
  } else if (currentSection === 'uploadSection') {
    currentSection = 'starSection';
  } else if (currentSection === 'gallerySection') {
    currentSection = 'uploadSection';
  }

  document.getElementById(currentSection).style.display = 'block';
}

// 12. Fullscreen Media View (image and video)
function openFullScreen(src, type) {
  const fullScreenOverlay = document.createElement('div');
  fullScreenOverlay.style.position = 'fixed';
  fullScreenOverlay.style.top = 0;
  fullScreenOverlay.style.left = 0;
  fullScreenOverlay.style.width = '100%';
  fullScreenOverlay.style.height = '100%';
  fullScreenOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  fullScreenOverlay.style.display = 'flex';
  fullScreenOverlay.style.alignItems = 'center';
  fullScreenOverlay.style.justifyContent = 'center';
  fullScreenOverlay.style.zIndex = 1000;

  let mediaElement;
  if (type === 'video') {
    mediaElement = document.createElement('video');
    mediaElement.src = src;
    mediaElement.controls = true;
    mediaElement.style.maxWidth = '90%';
    mediaElement.style.maxHeight = '90%';
  } else {
    mediaElement = document.createElement('img');
    mediaElement.src = src;
    mediaElement.style.maxWidth = '90%';
    mediaElement.style.maxHeight = '90%';
  }

  fullScreenOverlay.appendChild(mediaElement);

  fullScreenOverlay.addEventListener('click', () => {
    document.body.removeChild(fullScreenOverlay);
  });

  document.body.appendChild(fullScreenOverlay);
}

