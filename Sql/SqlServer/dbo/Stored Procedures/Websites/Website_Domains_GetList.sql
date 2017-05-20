CREATE PROCEDURE [dbo].[Website_Domains_GetList]
	@websiteId INT = 0
AS
	SELECT domain FROM WebsiteDomains WHERE websiteId=@websiteId