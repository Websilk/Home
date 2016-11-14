CREATE PROCEDURE [dbo].[GetWebsiteDomains]
	@websiteId INT = 0
AS
	SELECT domain FROM WebsiteDomains WHERE websiteId=@websiteId