CREATE TABLE [dbo].[WebsiteSubDomains] (
    [websiteId]   INT           NOT NULL,
	[pageId]      INT			NOT NULL DEFAULT 0,
    [subdomain]   NVARCHAR (25) NOT NULL,
    [domain]      NVARCHAR (50) NOT NULL,
    [datecreated] DATETIME      NOT NULL, 
    CONSTRAINT [PK_WebsiteSubDomains] PRIMARY KEY ([domain])
);


GO

CREATE INDEX [index_subDomains] ON [dbo].[WebsiteSubDomains] (websiteId)
