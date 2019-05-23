import snoowrap from "snoowrap";

export class RedditProvider {
    constructor(client) {
        this.client = client;
    }

    static async clientFromEnv() {
        return new RedditProvider(
            new snoowrap({
                userAgent: "RAWR",
                clientId: process.env.REACT_APP_REDDIT_CLIENT_ID,
                clientSecret: process.env.REACT_APP_REDDIT_CLIENT_SECRET,
                refreshToken: process.env.REACT_APP_REDDIT_REFRESH_TOKEN,
            })
        );
    }

    async findSubreddit({ query, exactMatch = false }) {
        return await this.client.searchSubredditNames({
            query: query,
            exact: exactMatch,
        });
    }

    async getSubreddit({ subreddit }) {
        return await this.client.getSubreddit(subreddit);
    }

    async getSubredditThreads({ subreddit, sort = "hot", limit = 0 }) {
        switch (sort.toLowerCase()) {
            case "hot":
                return await this.client.getHot(subreddit, {
                    limit: limit,
                });
            case "new":
                return await this.client.getNew(subreddit, {
                    limit: limit,
                });
            case "top":
                return await this.client.getTop(subreddit, {
                    limit: limit,
                });
            case "controversial":
                return await this.client.getControversial(subreddit, {
                    limit: limit,
                });
            case "rising":
                return await this.client.getRising(subreddit, {
                    limit: limit,
                });
            default:
                return [];
        }
    }

    async getThreadComments(threadId) {
        return await this.client
            .getSubmission(threadId)
            .expandReplies({ limit: Infinity, depth: Infinity }).comments;
    }
}

export class RedditFilter {
    static urlToSubredditAndId(url) {
        const regex = /reddit.com\/r\/([a-z0-9]*)\/comments\/([a-z0-9]*)\//gi;
        const result = regex.exec(url);

        if (result === null) return null;

        return { subreddit: result[1], threadId: result[2] };
    }

    static __matchForImage(body) {
        const regex = /https?:\/\/[^\s]+/gi;
        const matches = body.match(regex);
        return matches != null ? matches : [];
    }

    static __cleanUrl(url) {
        const isLetter = str => {
            return str.length === 1 && str.match(/[a-z]/i);
        };

        while (!isLetter(url.slice(-1))) {
            url = url.slice(0, -1);
        }

        return url;
    }

    static __isValidImage(url) {
        return (
            url.endsWith("jpg") || url.endsWith("jpeg") || url.endsWith("png")
        );
    }

    static async __filterDepth(comment) {
        let fulfilled = [];

        const expandedComment = await comment.expandReplies();
        const addImage = (comment, image) => {
            fulfilled.push({
                fulfilled_by: comment.author.name,
                image: image,
                score: comment.score,
            });
        };

        for (const reply of expandedComment.replies) {
            this.__matchForImage(reply.body)
                .map(url => this.__cleanUrl(url))
                .filter(url => this.__isValidImage(url))
                .forEach(image => addImage(reply, image));

            fulfilled = [...fulfilled, ...(await this.__filterDepth(reply))];
        }

        return fulfilled;
    }

    static async filterForImages(comments) {
        let results = [];
        for (const comment of comments) {
            const commissions = await this.__filterDepth(comment);
            if (!commissions || commissions.length === 0) {
                continue;
            }

            commissions.forEach(commision => {
                results.push({
                    requested_by: comment.author.name,
                    ...commision,
                });
            });
        }
        return results;
    }
}
