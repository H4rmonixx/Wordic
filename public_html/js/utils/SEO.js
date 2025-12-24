class SEO{
    static createCode(id, name){
        return `${id}-${name
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        }`;
    }

    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    static getIDAfter(segment, url = window.location.href) {
        const path = new URL(url).pathname;
        const seg = this.escapeRegex(segment);

        const regex = new RegExp(`/${seg}/(\\d+)(?:-|/|$)`);
        const match = path.match(regex);

        return match ? Number(match[1]) : null;
    }

    static getCodeAfter(segment, url = window.location.href) {
        const path = new URL(url).pathname;
        const seg = this.escapeRegex(segment);

        const regex = new RegExp(`/${seg}/([^/]+)`);
        const match = path.match(regex);

        return match ? match[1] : null;
    }
}