CREATE TABLE [dbo].[WebSites] (
    [websiteId]    INT            NOT NULL,
    [ownerId]      INT            NOT NULL,
    [title]        NVARCHAR (100) NOT NULL,
    [theme]        NVARCHAR (25)  NOT NULL DEFAULT 'default',
    [colors]       NVARCHAR (25)  NOT NULL DEFAULT '',
    [colorsEditor] NVARCHAR (25)  NOT NULL DEFAULT '',
    [colorsDash]   NVARCHAR (25)  NOT NULL DEFAULT '',
    [datecreated]  DATETIME       NOT NULL,
    [pagetemplate] INT            NULL,
	[pagedash]	   INT			  NOT NULL,
    [pagehome]     INT            NOT NULL,
    [pagelogin]    INT            NOT NULL,
    [pageabout]    INT            NULL,
    [pagecontact]  INT            NULL,
    [pagesupport]  INT            NULL,
    [page404]      INT            NULL,
    [pagedenied]   INT            NULL,
    [status]	   INT            NULL,
    [icon]         BIT            NULL,
    [enabled]      BIT            NULL,
    [deleted]      BIT            NULL,
    CONSTRAINT [PK_WebSites] PRIMARY KEY ([websiteId])
);


GO

CREATE INDEX [index_websites] ON [dbo].[WebSites] (websiteId)
