// Fetch real-time Steem and SBD prices
async function fetchSteemPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem,steem-dollars&vs_currencies=usd');
    const data = await response.json();

    document.getElementById('steem-price').textContent = `Steem Price: $${data.steem.usd}`;
    document.getElementById('sbd-price').textContent = `SBD Price: $${data['steem-dollars'].usd}`;
  } catch (error) {
    console.error('Error fetching Steem prices:', error);
  }
}

// Fetch account details
async function fetchAccountDetails(account) {
  try {
    const response = await fetch('https://api.steemit.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'get_accounts',
        params: [[account]],
        id: 4,
      }),
    });

    const data = await response.json();
    const accountData = data.result[0];

    if (accountData) {
      const votingPower = (accountData.voting_power / 100).toFixed(2);
      const reputation = ((Math.log10(accountData.reputation) - 9) * 9 + 25).toFixed(2);
      const creationDate = accountData.created;
      const latestTransfer = accountData.transfer_history?.[0]?.op || 'No recent transfers found';

      // Convert sbd_balance and steem_balance to numbers before performing arithmetic
      const steemPower = (parseFloat(accountData.sbd_balance) + parseFloat(accountData.steem_balance)).toFixed(3); // Combined Steem Power (if applicable)
      const followersCount = accountData.follower_count || 0;
      const followingCount = accountData.following_count || 0;
      const postCount = accountData.post_count || 0;

      // Update UI with the fetched data
      document.getElementById('account-voting-power').textContent = `Voting Power: ${votingPower}%`;
      document.getElementById('account-reputation').textContent = `Reputation: ${reputation}`;
      document.getElementById('account-creation-date').textContent = `Account Created: ${creationDate}`;
      document.getElementById('account-posts').textContent = `Posts: ${postCount}`;
    } else {
      alert('Account not found.');
    }
  } catch (error) {
    console.error('Error fetching account details:', error);
  }
}

// Fetch trending tags
async function fetchTrendingTags() {
  try {
    const response = await fetch('https://api.steemit.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'get_trending_tags',
        params: ['', 20],
        id: 1,
      }),
    });

    const data = await response.json();
    const tagsList = document.getElementById('tags-list');
    tagsList.innerHTML = ''; // Clear existing tags

    data.result.forEach(tag => {
      const listItem = document.createElement('li');
      listItem.textContent = tag.name;
      tagsList.appendChild(listItem);
    });
  } catch (error) {
    console.error('Error fetching trending tags:', error);
  }
}

// Fetch active witness accounts
async function fetchActiveAccounts() {
  try {
    const response = await fetch('https://api.steemit.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_active_witnesses',
        params: [],
        id: 2,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const accountsList = document.getElementById('accounts-list');
    accountsList.innerHTML = ''; // Clear existing accounts

    if (data.result && data.result.length > 0) {
      const accounts = data.result;

      // Add active accounts to the list
      accounts.forEach(account => {
        const listItem = document.createElement('li');
        listItem.textContent = account;
        accountsList.appendChild(listItem);
      });
    } else {
      console.warn('No active witness accounts found.');
      const listItem = document.createElement('li');
      listItem.textContent = 'No active witnesses found.';
      accountsList.appendChild(listItem);
    }
  } catch (error) {
    console.error('Error fetching active accounts:', error);
  }
}

// Fetch newly created posts (excluding comments)
async function fetchNewPosts() {
  try {
    const response = await fetch('https://api.steemit.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'get_discussions_by_created',
        params: [{ limit: 10 }],  // Fetch the latest 10 posts
        id: 1,
      }),
    });

    const data = await response.json();

    if (data.result && data.result.length > 0) {
      const postsList = document.getElementById('posts-list');
      postsList.innerHTML = '';  // Clear existing posts

      data.result.forEach(post => {
        // Check if the post is not a comment
        if (post.parent_author === '') {
          const postItem = document.createElement('li');
          
          // Create a clickable link to the full post
          const postLink = document.createElement('a');
          postLink.href = `https://steemit.com/@${post.author}/${post.permlink}`;
          postLink.target = '_blank'; // Open in a new tab
          postLink.innerHTML = `
            <strong>${post.author}</strong>: ${post.title} <br>
            <small>Created on: ${new Date(post.created).toLocaleString()}</small>
          `;

          postItem.appendChild(postLink);
          postsList.appendChild(postItem);
        }
      });
    } else {
      console.warn('No new posts found.');
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}


// Example usage of fetchNewPosts
document.getElementById('fetch-posts-button').addEventListener('click', () => {
  fetchNewPosts();
});

// Initialize Dashboard
function initDashboard() {
  fetchSteemPrices();
  fetchTrendingTags();
  fetchActiveAccounts();

  document.getElementById('search-button').addEventListener('click', () => {
    const account = document.getElementById('account-search').value;
    if (account) fetchAccountDetails(account);
  });
}

document.addEventListener('DOMContentLoaded', initDashboard);
