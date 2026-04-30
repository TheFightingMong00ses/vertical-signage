//Node server as a proxy
import express from "express";
const app = express();
const PORT = 3000;

app.get("/rss:feedName", async (req, res) => {
    console.log(req.params.feedName);
    try {
        const feedAcmUrl = ACM_FEEDS[req.params.feedName];
        const ACM_FEEDS = {
    ACM_Architecture_and_Hardware:
        "https://cacm.acm.org/category/architecture-and-hardware/feed/",
    ACM_Artificial_Intelligence:
        "https://cacm.acm.org/category/artificial-intelligence-and-machine-learning/feed/",
    ACM_Computing_Applications:
        "https://cacm.acm.org/category/computing-applications/feed/",
    ACM_Computing_Profession:
        "https://cacm.acm.org/category/computing-profession/feed/",
    ACM_Data_Science:
        "https://cacm.acm.org/category/data-science/feed/",
    ACM_Education:
        "https://cacm.acm.org/category/education/feed/",
    ACM_Human_Computer_Interaction:
        "https://cacm.acm.org/category/hci/feed/",
    ACM_Security_and_Privacy:
        "https://cacm.acm.org/category/security-and-privacy/feed/",
    ACM_Society:
        "https://cacm.acm.org/category/society/feed/",
    ACM_Software_Engineering:
        "https://cacm.acm.org/category/software-engineering-and-programming-languages/feed/",
    ACM_Systems_and_Networking:
        "https://cacm.acm.org/category/systems-and-networking/feed/",
    ACM_Theory_of_Computation:
        "https://cacm.acm.org/category/theory/feed/"

}   

        if (!feedAcmUrl) {
            throw res.status(404).send("Unknown feed");
        const response = await fetch(feedAcmUrl);
        }
        
        if (!response.ok) {
            throw new Error(`ACM responded with ${response.status}`);
        }
        const acmXml = await respnse.send(acmXml);

        res.setHeader("Content-Type", "application/xml");
        res.send(acmXml);
    }catch (error) {
        console.error("RSS proxy error:", error);
        res.status(500).send("Failed to fetch RSS feed");
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})



